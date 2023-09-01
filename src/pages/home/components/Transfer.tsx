import { CampaignConfig } from '@/configs';
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

    const handleTransfer = async () => {
        if (!receiverAddress) {
            message.error('Please input address');
            return;
        }

        setLoading(true);

        try {
            const userOp = await aaHelper.createTransferOp(receiverAddress);

            const userOpHash = await aaHelper.hashUserOp(userOp);
            console.log('userOpHash', userOpHash);
            const signature = await provider.getSigner().signMessage(userOpHash);

            userOp.signature = signature;

            const { txHash } = await aaHelper.sendUserOp(userOp);

            console.log('txHash');
            console.log(txHash);

            message.success('Transfer success');
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
        <div className="mintContainer transferContainer" style={props.style}>
            <div className="title">Send this NFT to your Galxe Wallet</div>
            <div className="img">
                <img src={CampaignConfig.nftIcon} alt="" />
            </div>
            <Input
                placeholder="Please enter your address used in Galxe Wallet"
                className="address"
                value={receiverAddress}
                onChange={(e) => {
                    setReceiverAddress(e.target.value);
                }}
            />
            <Button className="btn-mint" type="primary" onClick={handleTransfer} loading={loading}>
                <span className="btn-text">Gasless Transfer</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

export default Index;
