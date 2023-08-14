import type { UserInfo } from '@particle-network/auth';
import { AuthTypes, ParticleNetwork } from '@particle-network/auth';
import { opBNBTestnet } from '@particle-network/chains';
import { ParticleProvider } from '@particle-network/provider';
import { ethers } from 'ethers';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AAHelper from '../utils/aaHelper';

window.__PARTICLE_ENVIRONMENT__ = process.env.REACT_APP_PARTICLE_ENV;

interface GlobalState {
    particle: ParticleNetwork;
    connect: () => Promise<UserInfo>;
    disconnect: () => Promise<void>;
    provider: ethers.providers.Web3Provider;
    aaHelper: AAHelper;
    connected: boolean;
}

export const GlobalContext = createContext<GlobalState>({} as any);

export const useGlobal = () => useContext(GlobalContext);

export const GlobalContextProvider = (props: any) => {
    const [connected, setConnected] = useState(false);

    const particle = useMemo(() => {
        return new ParticleNetwork({
            projectId: process.env.REACT_APP_PROJECT_ID as string,
            clientKey: process.env.REACT_APP_CLIENT_KEY as string,
            appId: process.env.REACT_APP_APP_ID as string,
            chainName: opBNBTestnet.name,
            chainId: opBNBTestnet.id,
            wallet: {
                displayWalletEntry: false,
            },
        });
    }, []);

    const provider = useMemo(() => {
        return new ethers.providers.Web3Provider(new ParticleProvider(particle.auth), 'any');
    }, [particle]);

    const connect = useCallback(async () => {
        return await particle.auth.login({
            supportAuthTypes: AuthTypes.filter((item) => item !== 'facebook').join(','),
        });
    }, [particle]);

    const disconnect = useCallback(async () => {
        await particle.auth.logout(true);
    }, [particle]);

    const aaHelper = useMemo(() => new AAHelper(provider), [provider]);

    useEffect(() => {
        setConnected(particle.auth.isLogin());
        const onConnect = () => {
            setConnected(true);
        };
        const onDisconnect = () => {
            setConnected(false);
        };
        particle.auth.on('connect', onConnect);
        particle.auth.on('disconnect', onDisconnect);
        return () => {
            particle.auth.off('connect', onConnect);
            particle.auth.off('disconnect', onDisconnect);
        };
    }, [particle]);

    return (
        <GlobalContext.Provider value={{ particle, connect, disconnect, provider, aaHelper, connected }}>
            {props.children}
        </GlobalContext.Provider>
    );
};
