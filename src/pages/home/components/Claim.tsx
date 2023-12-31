import useParticle from '@/context/hooks/useParticle';
import usePimlico from '@/context/hooks/usePimlico';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Typography, message, notification } from 'antd';
import React, { useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [balance, setBalance] = useState('0.0');
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string>();
    const { provider, connected } = useParticle();
    const { pimlico } = usePimlico();
    const { currentStep } = props;

    const handleClick = async () => {
        setLoading(true);

        try {
            if (Number(balance) < 1) {
                const userOp = await pimlico.createMintTUSDCOp();
                const userOpHash = await pimlico.hashUserOp(userOp);
                console.log('userOpHash', userOpHash);
                const signature = await provider.getSigner().signMessage(userOpHash);
                userOp.signature = signature;
                console.log('userOp', userOp);
                const txHash = await pimlico.sendUserOp(userOp);
                console.log(`UserOperation included: https://goerli.lineascan.build/tx/${txHash}`);
                notification.success({
                    message: 'Claim tUSDC Success',
                    description: 'Click for more details',
                    onClick: () => {
                        window.open(`https://goerli.lineascan.build/tx/${txHash}`, '_blank');
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
            const senderAddress = await pimlico.getSenderAddress();
            setAddress(senderAddress);
            console.log('senderAddress', senderAddress);
            const balance = await pimlico.getTUSDCBalance(senderAddress);
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
    }, [pimlico, connected]);

    useEffect(() => {
        if (currentStep === 0) {
            setLoading(false);
            setBalance('0.0');
            setAddress(undefined);
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
                    window.open(`https://goerli.lineascan.build/address/${address}`, '_blank');
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
