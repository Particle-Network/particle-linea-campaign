import { CampaignConfig } from '@/configs';
import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect } from 'react';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const { currentStep } = props;
    const { particle, connected } = useParticle();

    useEffect(() => {
        if (connected && currentStep === 4) {
            localStorage.setItem(`completed_${particle.auth.userInfo()?.uuid}`, 'true');
        }
    }, [currentStep]);

    return (
        <div className="completedContainer" style={props.style}>
            <div className="congratulations">Congratulations!</div>
            <div className="finished">{CampaignConfig.finishedText}</div>
            <Button
                className="btn-more"
                type="primary"
                onClick={() => {
                    window.open('https://particle.network/', '_blank');
                }}
            >
                <span className="btn-text">Tell me more about Particle Network</span>
                <ArrowRightOutlined
                    style={{
                        position: 'absolute',
                        right: 8,
                    }}
                />
            </Button>
            <Button
                className="btn-more"
                type="primary"
                style={{ marginTop: 10 }}
                onClick={() => {
                    window.open(CampaignConfig.CampaignLink, '_blank');
                }}
            >
                <span className="btn-text">Go to Galxe and Claim Reward</span>
                <ArrowRightOutlined
                    style={{
                        position: 'absolute',
                        right: 8,
                    }}
                />
            </Button>
        </div>
    );
};

Index.displayName = 'Completed';

export default Index;
