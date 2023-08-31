import nftABI from '@/assest/abi/nft.json';
import tUSDCABI from '@/assest/abi/tUSDC.json';
import type { UserOperationStruct } from '@account-abstraction/contracts';
import {
    EntryPoint__factory,
    SimpleAccountFactory__factory,
    SimpleAccount__factory,
} from '@account-abstraction/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { type ChainInfo } from '@particle-network/chains';
import { ethers } from 'ethers';
import { getAddress, hexConcat, hexlify } from 'ethers/lib/utils';

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const SIMPLE_ACCOUNT_FACTORY_ADDRESS = '0x9406Cc6185a346906296840746125a0E44976454';

const T_USDC = '0x86C1B1cE04feEA34c98E2d7A1dE760ec57892404';

const T_USDT = '0xaFab613C6A8108B730801D1cC659E7393e0C0984';

const ConstractAddress = '0x74883445AF29A502a1866d1E847d9B2c5fF74ac4';

class AAHelper {
    private bundlerProvider;
    private paymasterProvider;
    private simpleAccountFactory;
    private entryPoint;
    constructor(private provider: ethers.providers.Web3Provider, chainInfo: ChainInfo) {
        this.bundlerProvider = new StaticJsonRpcProvider(
            `https://bundler-debug.particle.network?chainId=${chainInfo.id}`
        );
        this.paymasterProvider = new StaticJsonRpcProvider(
            `https://paymaster-debug.particle.network?chainId=${chainInfo.id}`
        );
        this.simpleAccountFactory = SimpleAccountFactory__factory.connect(
            SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            this.provider
        );
        this.entryPoint = EntryPoint__factory.connect(ENTRY_POINT_ADDRESS, this.provider);
    }

    getInitCode = async (): Promise<string> => {
        const accounts = await this.provider.listAccounts();
        return hexConcat([
            SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            this.simpleAccountFactory.interface.encodeFunctionData('createAccount', [accounts[0], 0]),
        ]);
    };

    getSenderAddress = async (): Promise<string> => {
        const owner = (await this.provider.listAccounts())[0];
        const localAddress = localStorage.getItem(`aa_${owner}`);
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
        localStorage.setItem(`aa_${owner}`, address);
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
        const sponsorUserOperationResult = await this.paymasterProvider.send('pm_sponsorUserOperation', [
            userOperation,
            ENTRY_POINT_ADDRESS,
        ]);

        const paymasterAndData = sponsorUserOperationResult.paymasterAndData;

        userOperation.paymasterAndData = paymasterAndData;
        return userOperation;
    };

    hashUserOp = async (userOperation: UserOperationStruct) => {
        return await this.entryPoint.getUserOpHash(userOperation);
    };

    sendUserOp = async (userOp: UserOperationStruct): Promise<string> => {
        const userOperationHash = await this.bundlerProvider.send('eth_sendUserOperation', [
            userOp,
            ENTRY_POINT_ADDRESS,
        ]);
        console.log('eth_sendUserOperation hash:', userOperationHash);

        // let's also wait for the userOperation to be included, by continually querying for the receipts
        console.log('Querying for receipts...');
        let receipt = null;
        while (receipt === null) {
            try {
                receipt = await this.bundlerProvider.send('eth_getUserOperationReceipt', [userOperationHash]);
                console.log('eth_getUserOperationReceipt', receipt);
                if (receipt === null) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 500);
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
        const sponsorUserOperationResult = await this.paymasterProvider.send('pm_sponsorUserOperation', [
            userOperation,
            ENTRY_POINT_ADDRESS,
        ]);

        const paymasterAndData = sponsorUserOperationResult.paymasterAndData;

        userOperation.paymasterAndData = paymasterAndData;
        return userOperation;
    };

    createMintOp = async (): Promise<UserOperationStruct> => {
        const senderAddress = await this.getSenderAddress();

        const code = await this.provider.getCode(senderAddress);
        const initCode = code === '0x' ? await this.getInitCode() : '0x';

        const erc20Interface = new ethers.utils.Interface(['function safeMint(address _to)']);
        const encodedData = erc20Interface.encodeFunctionData('safeMint', [senderAddress]);

        const to = ConstractAddress;
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

        const sponsorUserOperationResult = await this.paymasterProvider.send('pm_sponsorUserOperation', [
            userOperation,
            ENTRY_POINT_ADDRESS,
        ]);

        const paymasterAndData = sponsorUserOperationResult.paymasterAndData;

        userOperation.paymasterAndData = paymasterAndData;
        return userOperation;
    };

    createTransferOp = async (receiverAddress: string): Promise<UserOperationStruct> => {
        const senderAddress = await this.getSenderAddress();

        const code = await this.provider.getCode(senderAddress);
        const initCode = code === '0x' ? await this.getInitCode() : '0x';

        const erc20Interface = new ethers.utils.Interface([
            'function safeTransferFrom(address _from, address _to, uint256 _tokenId)',
        ]);

        const encodedData = erc20Interface.encodeFunctionData('safeTransferFrom', [
            senderAddress,
            receiverAddress,
            '2',
        ]);

        const to = ConstractAddress;
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

        const sponsorUserOperationResult = await this.paymasterProvider.send('pm_sponsorUserOperation', [
            userOperation,
            ENTRY_POINT_ADDRESS,
        ]);

        const paymasterAndData = sponsorUserOperationResult.paymasterAndData;

        userOperation.paymasterAndData = paymasterAndData;
        return userOperation;
    };

    getNftBalance = async (senderAddress: string) => {
        const contract = new ethers.Contract(ConstractAddress, nftABI, this.provider);
        const balance = await contract.balanceOf(senderAddress);
        console.log('balance', balance, balance.toNumber());
        return balance.toNumber();
    };
}

export default AAHelper;
