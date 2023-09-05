import { ReactComponent as CheckOutlined } from '@/assest/images/CheckOutlined.svg';
import { CampaignConfig } from '@/configs';
import useAAHelper from '@/context/hooks/useAAHelper';
import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAsyncEffect } from 'ahooks';
import { Button, message } from 'antd';
import { useState } from 'react';

const { ConstractAddress } = CampaignConfig;

message.config({
    top: 40,
});

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

            console.log('signature', signature);

            userOp.signature = signature;

            const { txHash, receipt } = await aaHelper.sendUserOp(userOp);

            const txLog = receipt?.logs?.find(
                (log: any) => log.address.toLowerCase() === ConstractAddress.toLowerCase()
            );

            console.log('receipt', receipt);
            console.log('txLog', txLog);
            console.log(txLog?.topics[3]);

            const tokenId = Number(txLog?.topics[3]);

            aaHelper.setTokenId(tokenId);

            console.log('txHash', txHash, 'tokenId', tokenId);

            message.success({
                className: 'message-success',
                icon: (
                    <div className="anticon">
                        <CheckOutlined />
                    </div>
                ),
                content: (
                    <>
                        <div className="message-success-title">Mint NFT Success</div>
                        <div className="message-success-description">Click for more details</div>
                    </>
                ),
                onClick: () => {
                    window.open(CampaignConfig.getBlockExplorerUrl(txHash), '_blank');
                },
            });

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
            <div className="img">
                <img src={CampaignConfig.nftIcon} alt="" />
            </div>
            <div className="address-title">Your Smart Account</div>
            <div
                className="address-value"
                onClick={() => {
                    window.open(CampaignConfig.getScanUrl(address), '_blank');
                }}
            >
                {address}
            </div>
            <Button className="btn-mint" type="primary" onClick={handleMint} loading={loading}>
                <span className="btn-text">Gasless Mint</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

export default Index;
