import {
    EntryPoint__factory,
    SimpleAccountFactory__factory,
    SimpleAccount__factory,
} from '@account-abstraction/contracts';

import tUSDCABI from '@/assest/abi/tUSDC.json';
import type { UserOperationStruct } from '@account-abstraction/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { getAddress, hexConcat, hexlify } from 'ethers/lib/utils';

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const SIMPLE_ACCOUNT_FACTORY_ADDRESS = '0x9406Cc6185a346906296840746125a0E44976454';
const API_KEY = 'a8010ecf-ef85-4464-a27c-84b0a5aa66aa';
const PIMLICO_ENDPOINT = `https://api.pimlico.io/v1/linea-testnet/rpc?apikey=${API_KEY}`;
export const T_USDC = '0x00db12A0D291FD269774dD5dF8077C6360bCb9C3';
export const T_USDT = '0x3fbBef2A36e7f80Bb0fF88f8111d058dD935E1ab';

class PimlicoAccount {
    private pimlicoProvider;
    private simpleAccountFactory;
    private entryPoint;
    constructor(private provider: ethers.providers.Web3Provider) {
        this.pimlicoProvider = new StaticJsonRpcProvider(PIMLICO_ENDPOINT);
        this.simpleAccountFactory = SimpleAccountFactory__factory.connect(
            SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            this.provider
        );
        this.entryPoint = EntryPoint__factory.connect(ENTRY_POINT_ADDRESS, this.provider);
    }

    getInitCode = async (): Promise<string> => {
        const accounts = await this.provider.listAccounts();
        const initCode = hexConcat([
            SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            this.simpleAccountFactory.interface.encodeFunctionData('createAccount', [accounts[0], 0]),
        ]);
        return initCode;
    };

    getSenderAddress = async (): Promise<string> => {
        const owner = (await this.provider.listAccounts())[0];
        const localAddress = localStorage.getItem(`pimlico_${owner}`);
        if (localAddress) {
            return localAddress;
        }
        const initCode = await this.getInitCode();
        const address = await this.entryPoint.callStatic
            .getSenderAddress(initCode)
            .then(() => {
                throw new Error('Expected getSenderAddress() to revert');
            })
            .catch((e) => {
                const data = e.message.match(/0x6ca7b806([a-fA-F\d]*)/)?.[1];
                if (!data) {
                    return Promise.reject(new Error('Failed to parse revert data'));
                }
                const addr = getAddress(`0x${data.slice(24, 64)}`);
                return Promise.resolve(addr);
            });
        localStorage.setItem(`pimlico_${owner}`, address);
        return address;
    };

    createMintTUSDCOp = async (): Promise<UserOperationStruct> => {
        const senderAddress = await this.getSenderAddress();
        const code = await this.provider.getCode(senderAddress);
        const initCode = code === '0x' ? await this.getInitCode() : '0x';

        const erc20Interface = new ethers.utils.Interface(['function mint(address _to)']);
        const encodedData = erc20Interface.encodeFunctionData('mint', [senderAddress]);

        const to = T_USDC;
        const value = 0;
        const data = encodedData;

        const simpleAccount = SimpleAccount__factory.connect(senderAddress, this.provider);
        const callData = simpleAccount.interface.encodeFunctionData('execute', [to, value, data]);
        const gasPrice = await this.provider.getGasPrice();
        const nonce = await this.entryPoint.getNonce(senderAddress, 0);

        const userOperation = {
            sender: senderAddress,
            nonce: hexlify(nonce),
            initCode,
            callData,
            callGasLimit: hexlify(100_000), // hardcode it for now at a high value
            verificationGasLimit: hexlify(400_000), // hardcode it for now at a high value
            preVerificationGas: hexlify(50_000), // hardcode it for now at a high value
            maxFeePerGas: hexlify(gasPrice),
            maxPriorityFeePerGas: hexlify(gasPrice),
            paymasterAndData: '0x',
            signature: '0x',
        };
        const sponsorUserOperationResult = await this.pimlicoProvider.send('pm_sponsorUserOperation', [
            userOperation,
            {
                entryPoint: ENTRY_POINT_ADDRESS,
            },
        ]);

        const paymasterAndData = sponsorUserOperationResult.paymasterAndData;

        userOperation.paymasterAndData = paymasterAndData;
        return userOperation;
    };

    hashUserOp = async (userOperation: UserOperationStruct) => {
        return await this.entryPoint.getUserOpHash(userOperation);
    };

    sendUserOp = async (userOp: UserOperationStruct): Promise<string> => {
        const userOperationHash = await this.pimlicoProvider.send('eth_sendUserOperation', [
            userOp,
            ENTRY_POINT_ADDRESS,
        ]);
        console.log('eth_sendUserOperation hash:', userOperationHash);

        // let's also wait for the userOperation to be included, by continually querying for the receipts
        console.log('Querying for receipts...');
        let receipt = null;
        while (receipt === null) {
            try {
                receipt = await this.pimlicoProvider.send('eth_getUserOperationReceipt', [userOperationHash]);
                console.log('eth_getUserOperationReceipt', receipt);
                if (receipt === null) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 2000);
                    });
                }
            } catch (error) {
                console.log('eth_getUserOperationReceipt', error);
            }
        }

        const txHash = receipt.receipt.transactionHash;
        return txHash;
    };

    getTUSDCBalance = async (senderAddress: string) => {
        const contract = new ethers.Contract(T_USDC, tUSDCABI, this.provider);
        const balance = await contract.balanceOf(senderAddress);
        return ethers.utils.formatUnits(balance, 6);
    };

    getTUSDTBalance = async (senderAddress: string) => {
        const contract = new ethers.Contract(T_USDT, tUSDCABI, this.provider);
        const balance = await contract.balanceOf(senderAddress);
        return ethers.utils.formatUnits(balance, 6);
    };

    swapToken = async (address: string) => {
        const senderAddress = await this.getSenderAddress();
        const approveResut = await this.provider.send('particle_swap_checkApprove', [
            senderAddress,
            {
                tokenAddress: T_USDC,
                amount: '1000000',
                provider: 'izi-swap',
            },
        ]);

        console.log('approveResult', approveResut);

        const to = [];
        const data = [];

        if (!approveResut.approved) {
            to.push(approveResut.tx.to);
            data.push(approveResut.tx.data);
        }

        const swapResult = await this.provider.send('particle_swap_getSwap', [
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

        to.push(swapResult.tx.to);
        data.push(swapResult.tx.data);

        const simpleAccount = SimpleAccount__factory.connect(senderAddress, this.provider);
        const callData = simpleAccount.interface.encodeFunctionData('executeBatch', [to, data]);
        const gasPrice = await this.provider.getGasPrice();
        const code = await this.provider.getCode(senderAddress);
        const initCode = code === '0x' ? await this.getInitCode() : '0x';
        const nonce = await this.entryPoint.getNonce(senderAddress, 0);

        const userOperation = {
            sender: senderAddress,
            nonce: hexlify(nonce),
            initCode,
            callData,
            callGasLimit: hexlify(200_000), // hardcode it for now at a high value
            verificationGasLimit: hexlify(400_000), // hardcode it for now at a high value
            preVerificationGas: hexlify(50_000), // hardcode it for now at a high value
            maxFeePerGas: hexlify(gasPrice),
            maxPriorityFeePerGas: hexlify(gasPrice),
            paymasterAndData: '0x',
            signature: '0x',
        };
        console.log('Swap UserOp', userOperation);
        const sponsorUserOperationResult = await this.pimlicoProvider.send('pm_sponsorUserOperation', [
            userOperation,
            {
                entryPoint: ENTRY_POINT_ADDRESS,
            },
        ]);

        const paymasterAndData = sponsorUserOperationResult.paymasterAndData;

        userOperation.paymasterAndData = paymasterAndData;
        return userOperation;
    };
}

export default PimlicoAccount;
