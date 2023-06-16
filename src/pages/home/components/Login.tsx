import useParticle from '@/context/hooks/useParticle';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, { useState } from 'react';
import { Logo } from '../icons';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);

    const { connect } = useParticle();

    const handleClick = async () => {
        setLoading(true);
        try {
            await connect();
            props.onSuccess();
        } catch (error: any) {
            console.log('connect error', error);
            if (error.message) {
                message.error(error.message);
            }
        }
        setLoading(false);
    };

    return (
        <div className="loginContainer" style={props.style}>
            <div className="btn-logo">
                <div className="btn-logo-shadow-left" />
                <div className="btn-logo-shadow-right" />
                <div className="btn-logo-shadow-mask" />
                <Logo />
            </div>
            <Button className="btn-login" type="primary" loading={loading} onClick={handleClick}>
                <span className="btn-text">Connect</span>
                <ArrowRightOutlined />
            </Button>
        </div>
    );
};

Index.displayName = 'Login';

export default Index;
