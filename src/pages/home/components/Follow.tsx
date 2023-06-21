import { ArrowRightOutlined, TwitterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useState } from 'react';
import { getTwitterFollowUrl } from '../config';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        setLoading(false);
        props.onSuccess();
    };

    return (
        <div className="connectContainer" style={props.style}>
            <div className="btn-logo">
                <div className="btn-logo-wraper">
                    <div className="btn-logo-inner">
                        <TwitterOutlined />
                    </div>
                </div>
            </div>
            <div>
                <Button
                    className="btn-connect btn-connect-mobile"
                    type="primary"
                    loading={loading}
                    href="https://twitter.com/ParticleNtwrk"
                    onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                            props.onSuccess();
                        }, 2e4);
                    }}
                >
                    <span className="btn-text">Follow @ParticleNtwrk</span>
                    <ArrowRightOutlined />
                </Button>
                <Button
                    className="btn-connect btn-connect-pc"
                    type="primary"
                    loading={loading}
                    onClick={() => {
                        setLoading(true);
                        window.open(getTwitterFollowUrl(), '_blank');
                        setTimeout(() => {
                            setLoading(false);
                            props.onSuccess();
                        }, 2e4);
                    }}
                >
                    <span className="btn-text">Follow @ParticleNtwrk</span>
                    <ArrowRightOutlined />
                </Button>
            </div>
        </div>
    );
};

Index.displayName = 'Follow';

export default Index;
