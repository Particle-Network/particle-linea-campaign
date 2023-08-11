import tUSDCABI from '@/assest/abi/tUSDC.json';
import { SmartAccount } from '@particle-network/aa';
import { opBNBTestnet } from '@particle-network/chains';
import type { ParticleProvider } from '@particle-network/provider';
import { ethers } from 'ethers';

export const T_USDC = '0x86C1B1cE04feEA34c98E2d7A1dE760ec57892404';
export const T_USDT = '0xaFab613C6A8108B730801D1cC659E7393e0C0984';

class AAHelper {
    private smartAccount;
    private signer;
    constructor(provider: ParticleProvider) {
        this.smartAccount = new SmartAccount(provider, {
            projectId: process.env.REACT_APP_PROJECT_ID as string,
            clientKey: process.env.REACT_APP_CLIENT_KEY as string,
            appId: process.env.REACT_APP_APP_ID as string,
            networkConfig: [
                {
                    chainId: opBNBTestnet.id,
                    dappAPIKey: process.env.REACT_APP_DAPP_API_KEY as string,
                },
            ],
        });
        this.signer = new ethers.providers.Web3Provider(provider, 'any').getSigner();
    }

    getAddress = async (): Promise<string> => {
        const address = await this.smartAccount.getAddress();
        return address;
    };

    mintTUSDC = async (): Promise<string> => {
        const address = await this.getAddress();

        const erc20Interface = new ethers.utils.Interface(['function mint(address _to)']);
        const encodedData = erc20Interface.encodeFunctionData('mint', [address]);

        const to = T_USDC;
        const value = '0x';
        const data = encodedData;

        const tx = {
            to,
            value,
            data,
        };
        return this.smartAccount.sendTransaction({ tx });
    };

    getTUSDCBalance = async (senderAddress: string) => {
        const contract = new ethers.Contract(T_USDC, tUSDCABI, this.signer);
        const balance = await contract.balanceOf(senderAddress);
        return ethers.utils.formatUnits(balance, 6);
    };

    getTUSDTBalance = async (senderAddress: string) => {
        const contract = new ethers.Contract(T_USDT, tUSDCABI, this.signer);
        const balance = await contract.balanceOf(senderAddress);
        return ethers.utils.formatUnits(balance, 6);
    };

    swapToken = async (address: string): Promise<string> => {
        const senderAddress = await this.getAddress();
        const approveResut = await this.signer.provider.send('particle_swap_checkApprove', [
            senderAddress,
            {
                tokenAddress: T_USDC,
                amount: '1000000',
                provider: 'izi-swap',
            },
        ]);

        console.log('approveResult', approveResut);

        let approveTx;
        if (!approveResut.approved) {
            approveTx = approveResut.tx;
        }

        const swapResult = await this.signer.provider.send('particle_swap_getSwap', [
            senderAddress,
            {
                fromTokenAddress: T_USDC,
                toTokenAddress: T_USDT,
                amount: '1000000',
                slippage: 5,
                provider: 'izi-swap',
                receiverAddress: address,
            },
        ]);
        console.log('swapResult', swapResult);

        const swapTx = swapResult.tx;

        return this.smartAccount.sendTransaction(approveTx ? { tx: [approveTx, swapTx] } : { tx: swapTx });
    };
}

export default AAHelper;
