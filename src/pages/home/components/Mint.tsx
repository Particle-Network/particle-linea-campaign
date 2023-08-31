import MintImg from '@/assest/images/mint.gif';
import useAAHelper from '@/context/hooks/useAAHelper';
import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAsyncEffect } from 'ahooks';
import { Button, message } from 'antd';
import { useState } from 'react';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string>('');

    const { connected, provider } = useParticle();
    const { aaHelper } = useAAHelper();

    const handleMint = async () => {
        setLoading(true);

        try {
            const userOp = await aaHelper.createMintOp();

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

    useAsyncEffect(async () => {
        if (connected) {
            const senderAddress = await aaHelper.getSenderAddress();
            setAddress(senderAddress);
        }
    }, [aaHelper, connected]);

    return (
        <div className="mintContainer" style={props.style}>
            <div className="title">You wil get this NFT!</div>
            <div className="img">
                <img src={MintImg} alt="" />
            </div>
            <div className="address-title">Your Smart Contract Account:</div>
            <div className="address-value">{address}</div>
            <Button className="btn-mint" type="primary" onClick={handleMint} loading={loading}>
                <span className="btn-text">Mint</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

export default Index;
