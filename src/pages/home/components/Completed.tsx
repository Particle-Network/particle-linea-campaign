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
            <div className="finished">You have finished the quests for Particle x Linea Voyage Campaign</div>
            <Button
                className="btn-more"
                type="primary"
                onClick={() => {
                    window.open('https://particle.network/', '_blank');
                }}
            >
                <span className="btn-text">Tell me more about Particle Network</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

Index.displayName = 'Completed';

export default Index;
