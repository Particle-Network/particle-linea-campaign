import { useContext } from 'react';
import { GlobalContext } from '..';

const useParticle = () => {
    const { particle, provider, connect, disconnect, connected } = useContext(GlobalContext);
    return {
        particle,
        provider,
        connect,
        disconnect,
        connected,
    };
};

export default useParticle;
