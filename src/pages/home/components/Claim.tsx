import { CampaignConfig } from '@/configs';
import useAAHelper from '@/context/hooks/useAAHelper';
import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Typography, message, notification } from 'antd';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [balance, setBalance] = useState('0.0');
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string>('');
    const { connected, provider } = useParticle();
    const { aaHelper } = useAAHelper();
    const { currentStep } = props;

    const handleClick = async () => {
        setLoading(true);

        try {
            if (Number(balance) < 1) {
                const userOp = await aaHelper.createMintTUSDCOp();
                const userOpHash = await aaHelper.hashUserOp(userOp);
                console.log('userOpHash', userOpHash);
                const signature = await provider.getSigner().signMessage(userOpHash);
                userOp.signature = signature;
                console.log('userOp', userOp);
                const { txHash } = await aaHelper.sendUserOp(userOp);
                const url = CampaignConfig.getBlockExplorerUrl(txHash);
                console.log(`UserOperation included: ${url}`);
                notification.success({
                    message: 'Claim tUSDC Success',
                    description: 'Click for more details',
                    onClick: () => {
                        window.open(url, '_blank');
                    },
                });
            }

            props.onSuccess();
        } catch (error: any) {
            console.log('connect error', error);
            if (error.message) {
                message.error(error.message);
            }
            if (error.code === 8005 || error.code === 10005) {
                window.location.reload();
            }
        }

        setLoading(false);
    };

    const getBalance = async () => {
        console.log('getBalance started');
        try {
            const senderAddress = await aaHelper.getSenderAddress();
            setAddress(senderAddress);
            console.log('senderAddress', senderAddress);
            const balance = await aaHelper.getTUSDCBalance(senderAddress);
            console.log('balance', balance.toString());
            setBalance(balance.toString());
            if (Number(balance) >= 1) {
                console.log('getBalance and onSuccess');
                props.onSuccess();
            }
        } catch (error) {
            //ignore
        }
    };

    useEffect(() => {
        if (connected) {
            getBalance();
        }
    }, [aaHelper, connected]);

    useEffect(() => {
        if (currentStep === 0) {
            setLoading(false);
            setBalance('0.0');
            setAddress('');
        }
    }, [currentStep]);

    return (
        <div className="claimContainer" style={props.style}>
            <div className="balance">
                Your Current tUSDC Balance: <Text style={{ color: 'white', fontWeight: 'bold' }}>{balance}</Text>
            </div>
            <div className="address-title">Your Smart Contract Account:</div>
            <div
                className="address-value"
                onClick={() => {
                    window.open(CampaignConfig.getScanUrl(address), '_blank');
                }}
            >
                {address || ''}
            </div>
            <Button className="btn-claim" type="primary" loading={loading} onClick={handleClick}>
                <span className="btn-text">Gasless Claim</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

Index.displayName = 'Claim';

export default Index;
