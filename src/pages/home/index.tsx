import useParticle from '@/context/hooks/useParticle';
import usePimlico from '@/context/hooks/usePimlico';
import { DownOutlined, HeartTwoTone } from '@ant-design/icons';
import { Button, Popover, Steps, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import type { OpaqueConfig, PlainStyle } from 'react-motion';
import { Motion, spring } from 'react-motion';
import { ComponentHeight, ComponentItems, SpringSettings, StepsItems, isDevelopment } from './config';
import { IZumi, Linea, Logo, Pimlico } from './icons';
import './index.scss';

const Index = () => {
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [address, setAddress] = useState<string>();

    const { particle, connected, connect, disconnect } = useParticle();
    const { pimlico } = usePimlico();

    useEffect(() => {
        if (particle.auth.isLogin()) {
            setCurrentStep(localStorage.getItem(`completed_${particle.auth.userInfo()?.uuid}`) ? 4 : 1);
        }
        setLoading(false);
    }, [setCurrentStep, setLoading]);

    const configs: { top: OpaqueConfig }[] = ComponentItems.map((v, i) => {
        const value = (i - currentStep) * ComponentHeight;
        return {
            top: spring(value, SpringSettings),
        };
    });

    useEffect(() => {
        if (connected) {
            pimlico
                .getSenderAddress()
                .then((address) => {
                    setAddress(address);
                })
                .catch((e) => console.log(e));
        } else {
            setAddress(undefined);
        }
    }, [pimlico, connected]);

    const onConnect = async () => {
        try {
            await connect();
            setCurrentStep(localStorage.getItem(`completed_${particle.auth.userInfo()?.uuid}`) ? 4 : 1);
        } catch (error: any) {
            console.log('connect error', error);
            if (error.message) {
                message.error(error.message);
            }
        }
    };

    if (loading) {
        return null;
    }

    const onDisconnect = async () => {
        try {
            await disconnect();
            setCurrentStep(0);
        } catch (error: any) {
            console.log('disconnect error', error);
            if (error.message) {
                message.error(error.message);
            }
        }
    };

    const onScan = () => {
        const scanUrl = `https://goerli.lineascan.build/address/${address}`;
        window.open(scanUrl, '_blank');
    };

    const content = (
        <div>
            <div className="btn-popover-disconnect" onClick={onScan}>
                Scan
            </div>
            <div className="btn-popover-disconnect" onClick={onDisconnect}>
                Disconnect
            </div>
        </div>
    );

    return (
        <div className="container">
            <div className={classNames('btns-debug', { hidden: !isDevelopment })}>
                <Button
                    type="primary"
                    onClick={() => {
                        setCurrentStep(currentStep === 0 ? 4 : currentStep - 1);
                    }}
                >
                    上一步
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        setCurrentStep(currentStep === 4 ? 0 : currentStep + 1);
                    }}
                >
                    下一步
                </Button>
            </div>
            <div className="container-mask-left-top" />
            <div className="container-mask-right-top" />
            <div className="container-mask-left-bottom" />
            <div className="container-mask-ball" />
            <div className="box-logo-connect">
                <a className="header-logo" href="https://particle.network/" target="_blank">
                    <span className="header-logo-svg">
                        <span className="header-logo-svg-wraper">
                            <Logo />
                        </span>
                    </span>
                    <span className="header-text">About Particle Network</span>
                </a>
                {!connected && (
                    <Button className="btn-connect-action" type="primary" onClick={onConnect}>
                        <span className="btn-linear-text">Connect</span>
                    </Button>
                )}

                {connected && address && (
                    <Popover placement="bottom" content={content} trigger="click">
                        <Button className="btn-connect-action" type="primary">
                            <span className="btn-linear-text">{`${address.slice(0, 5)}...${address.slice(-5)}`}</span>
                            <DownOutlined />
                        </Button>
                    </Popover>
                )}
            </div>
            <div className="header">
                <div className="title">Particle @ Linea Voyage</div>
                <div className="subtitle">
                    Powered by Consensys, Linea is a developer-ready zk rollup designed for scaling and accelerating
                    Ethereum dApps
                </div>
            </div>
            <div className="main">
                <div className="main-wraper">
                    <div className="main-content">
                        <Steps
                            direction="vertical"
                            current={currentStep}
                            status={currentStep === 4 ? 'finish' : 'process'}
                            items={StepsItems}
                        />
                        <Motion style={{}}>
                            {(container: PlainStyle) => {
                                return (
                                    <div style={container} className="content">
                                        {configs.map((style, i) => {
                                            const { Component } = ComponentItems[i];
                                            return (
                                                <Motion style={style} key={i}>
                                                    {(style: React.CSSProperties) => {
                                                        return (
                                                            <Component
                                                                style={style}
                                                                onSuccess={() => {
                                                                    setCurrentStep(i + 1);
                                                                }}
                                                                currentStep={currentStep}
                                                            />
                                                        );
                                                    }}
                                                </Motion>
                                            );
                                        })}
                                    </div>
                                );
                            }}
                        </Motion>
                    </div>
                </div>
            </div>
            <div className="footer">
                <div className="presented">
                    Presented by{' '}
                    <a href="https://particle.network/" target="_blank">
                        Particle Network
                    </a>{' '}
                    with <HeartTwoTone twoToneColor="#ff4d4f" />
                </div>
                <div className="thanks">
                    <span>And many thanks to our friends at</span>
                    <a href="https://linea.build/" target="_blank">
                        <Linea />
                    </a>
                    <a href="https://izumi.finance/" target="_blank">
                        <IZumi />
                    </a>
                    <a href="https://www.pimlico.io/" target="_blank">
                        <Pimlico />
                    </a>
                    <span>to make this happen</span>
                </div>
                <div className="reserved">© 2023 PARTICLE NETWORK. ALL RIGHTS RESERVED</div>
            </div>
        </div>
    );
};

Index.displayName = 'Home';

export default Index;
