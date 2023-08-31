import useAAHelper from '@/context/hooks/useAAHelper';
import useParticle from '@/context/hooks/useParticle';
import { useAsyncEffect } from 'ahooks';
import { useState } from 'react';

interface IProps {
    style: React.CSSProperties;
    onSuccess: () => void;
    currentStep: number;
}

const Index = (props: IProps) => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string>();

    const { connected, provider } = useParticle();
    const { aaHelper } = useAAHelper();

    useAsyncEffect(async () => {
        if (connected) {
            const senderAddress = await aaHelper.getSenderAddress();
            setAddress(senderAddress);
        }
    }, [aaHelper, connected]);

    return (
        <div className="transferContainer" style={props.style}>
            Transfer
        </div>
    );
};

export default Index;
