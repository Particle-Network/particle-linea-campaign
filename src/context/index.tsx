import { CampaignConfig, EnvData } from '@/configs';
import type { UserInfo } from '@particle-network/auth';
import { AuthTypes, ParticleNetwork } from '@particle-network/auth';
import { ParticleProvider } from '@particle-network/provider';
import { ethers } from 'ethers';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AAHelper from '../utils/aaHelper';

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
            projectId: EnvData.PROJECT_ID,
            clientKey: EnvData.CLIENT_KEY,
            appId: EnvData.APP_ID,
            chainName: CampaignConfig.Chain.name,
            chainId: CampaignConfig.Chain.id,
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

    const aaHelper = useMemo(() => new AAHelper(provider, CampaignConfig.Chain), [provider]);

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
