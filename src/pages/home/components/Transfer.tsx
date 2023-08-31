import MintImg from '@/assest/images/mint.gif';
import useAAHelper from '@/context/hooks/useAAHelper';
import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useState } from 'react';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);
    const [receiverAddress, setReceiverAddress] = useState<string>('');

    const { provider } = useParticle();
    const { aaHelper } = useAAHelper();

    const handleMint = async () => {
        if (!receiverAddress) {
            message.error('Please input address');
            return;
        }

        // const isValidate = ethers.utils.isAddress(receiverAddress);
        // if (isValidate) {
        //     message.error('Invalid address');
        //     return;
        // }

        try {
            const balance = await aaHelper.getNftBalance(receiverAddress);
            if (balance >= 1) {
                message.error('You already mint this NFT to this address');
                return;
            }
        } catch (error: any) {
            message.error(error.message);
            return;
        }

        setLoading(true);

        try {
            const userOp = await aaHelper.createTransferOp(receiverAddress);

            const userOpHash = await aaHelper.hashUserOp(userOp);
            console.log('userOpHash', userOpHash);
            const signature = await provider.getSigner().signMessage(userOpHash);

            userOp.signature = signature;

            const txHash = await aaHelper.sendUserOp(userOp);

            console.log('txHash');
            console.log(txHash);

            message.success('Mint success');
            props.onSuccess();
        } catch (error: any) {
            console.log('mint error', error);
            if (error.message) {
                message.error(error.message);
            }
        }

        setLoading(false);
    };

    return (
        <div className="mintContainer" style={props.style}>
            <div className="title">You wil get this NFT!</div>
            <div className="img">
                <img src={MintImg} alt="" />
            </div>
            <div className="address-title">Your Smart Contract Account:</div>
            <Input
                className="address"
                value={receiverAddress}
                onChange={(e) => {
                    setReceiverAddress(e.target.value);
                }}
            />
            <Button className="btn-mint" type="primary" onClick={handleMint} loading={loading}>
                <span className="btn-text">Mint</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

export default Index;
