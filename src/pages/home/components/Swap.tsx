import useParticle from '@/context/hooks/useParticle';
import usePimlico from '@/context/hooks/usePimlico';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Input, Modal, message, notification } from 'antd';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Swap } from '../icons';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);
    const [usdcBalance, setUSDCBalance] = useState<string>('0.0');
    const [usdtBalance, setUSDTBalance] = useState<string>('0.0');
    const [address, setAddress] = useState('');
    const [hintModal, setHintModal] = useState(false);
    const [swapComplete, setSwapComplete] = useState(false);
    const [visibleError, setVisibleError] = useState(false);
    const [txHash, setTXHash] = useState<string>();
    const { provider, connected } = useParticle();
    const { pimlico } = usePimlico();

    const { currentStep } = props;

    const handleClick = async () => {
        if (!ethers.utils.isAddress(address)) {
            setVisibleError(true);
            return;
        }
        setHintModal(true);
    };

    const swapToken = async (receiverAddress: string) => {
        setHintModal(false);
        setLoading(true);
        try {
            const userOp = await pimlico.swapToken(receiverAddress);
            const userOpHash = await pimlico.hashUserOp(userOp);
            console.log('userOpHash', userOpHash);
            const signature = await provider.getSigner().signMessage(userOpHash);
            userOp.signature = signature;
            console.log('userOp', userOp);
            const txHash = await pimlico.sendUserOp(userOp);
            setTXHash(txHash);
            console.log(`UserOperation included: https://goerli.lineascan.build/tx/${txHash}`);
            notification.success({
                message: 'Swap Success',
                description: 'Click for more details',
                onClick: () => {
                    window.open(`https://goerli.lineascan.build/tx/${txHash}`, '_blank');
                },
            });
            await refreshBalance(receiverAddress);
            setSwapComplete(true);
        } catch (error: any) {
            console.log('Swap', error);
            if (error.message) {
                message.error(error.message);
            }
            if (error.code === 8005 || error.code === 10005) {
                window.location.reload();
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        if (connected && currentStep === 3) {
            pimlico
                .getSenderAddress()
                .then((address) => pimlico.getTUSDCBalance(address))
                .then((result) => setUSDCBalance(result))
                .catch((e) => console.error(e));
        }
    }, [pimlico, connected, currentStep]);

    useEffect(() => {
        if (currentStep === 0) {
            setAddress('');
            setUSDCBalance('0.0');
            setUSDTBalance('0.0');
            setVisibleError(false);
            setLoading(false);
            setTXHash(undefined);
            setSwapComplete(false);
        }
    }, [currentStep]);

    const refreshBalance = async (receiverAddress: string) => {
        try {
            const senderAddress = await pimlico.getSenderAddress();
            await Promise.all([
                pimlico.getTUSDCBalance(senderAddress).then((result) => setUSDCBalance(result)),
                pimlico.getTUSDTBalance(receiverAddress).then((result) => setUSDTBalance(result)),
            ]);
        } catch (error) {
            //ignore
        }
    };

    return (
        <div className="swapContainer" style={props.style}>
            <div className="balance">
                <div className="balance-item">
                    <div>Your Current tUSDC</div>
                    <div>Balance: {usdcBalance}</div>
                </div>
                <div className="balance-item">
                    <div>Your Galxe tUSDT</div>
                    <div>Balance: {usdtBalance}</div>
                </div>
            </div>
            <div>
                <Swap />
            </div>

            {swapComplete && (
                <>
                    <Button
                        className="btn-check-tx"
                        type="text"
                        onClick={() => {
                            window.open(`https://goerli.lineascan.build/tx/${txHash}`, '_blank');
                        }}
                    >
                        Check Transaction Here
                    </Button>
                    <Button className="btn-swap" type="primary" onClick={() => props.onSuccess()}>
                        <span className="btn-text">Next</span>
                        <ArrowRightOutlined />
                    </Button>
                </>
            )}

            {!swapComplete && (
                <>
                    <div className="swap">Swap to your address used in Galxe</div>
                    <Input
                        className="address"
                        value={address}
                        placeholder="Please enter your address used in Galxe"
                        onChange={(e) => {
                            setVisibleError(false);
                            setAddress(e.target.value);
                        }}
                    />
                    <Button className="btn-swap" type="primary" loading={loading} onClick={handleClick}>
                        <span className="btn-text">Gasless Swap</span>
                        <ArrowRightOutlined />
                    </Button>
                    {visibleError && <div className="error">Sorry, the address format is incorrect</div>}
                </>
            )}

            <Modal
                className="address-hint"
                open={hintModal}
                centered
                onCancel={() => setHintModal(false)}
                closable={false}
                footer={null}
            >
                <p className="hint-content">
                    Are you sure the recipient address is the address for the Linea Voyage on Galxe?
                </p>
                <p className="hint-address">{address}</p>

                <div className="modal-bottom-btn">
                    <Button type="primary" shape="round" onClick={() => swapToken(address)}>
                        Confirm!
                    </Button>
                    <Button type="ghost" shape="round" onClick={() => setHintModal(false)}>
                        Not Sure...
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

Index.displayName = 'Swap';

export default Index;
