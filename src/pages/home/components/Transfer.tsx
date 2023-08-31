import MintImg from '@/assest/images/mint.gif';
import useAAHelper from '@/context/hooks/useAAHelper';
import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAsyncEffect } from 'ahooks';
import { Button } from 'antd';
import { useState } from 'react';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string>();

    const { connected, provider } = useParticle();
    const { aaHelper } = useAAHelper();

    useAsyncEffect(async () => {
        if (connected) {
            const senderAddress = await aaHelper.getSenderAddress();
            setAddress(senderAddress);
        }
    }, [aaHelper, connected]);

    const handleTransfer = async () => {};

    return (
        <div className="mintContainer" style={props.style}>
            <div className="title">You wil get this NFT!</div>
            <div className="img">
                <img src={MintImg} alt="" />
            </div>
            <div className="address-title">Your Smart Contract Account:</div>
            <div className="address-value">{address}</div>
            <Button className="btn-mint" type="primary" onClick={handleTransfer}>
                <span className="btn-text">Mint</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

export default Index;
