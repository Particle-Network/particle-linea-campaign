import ComboIcon from '@/assest/images/Combo.png';
import NftBNB from '@/assest/images/NftBNB.gif';
import NftCombo from '@/assest/images/NftCombo.gif';
import NftScroll from '@/assest/images/NftScroll.gif';
import ScrollIcon from '@/assest/images/Scroll.png';
import opBNBIcon from '@/assest/images/opBNB.png';
import { ComboTestnet, ScrollSepolia, opBNB } from '@particle-network/chains';
import { getCurrentChainId } from './chain';

const isDevelopment = Boolean(window.location.port);

const isDebug = window.location.host.includes('debug');

const isProduction = !isDevelopment && !isDebug;

window.__PARTICLE_ENVIRONMENT__ = isProduction ? 'production' : 'development';

const DebugEnv = {
    PROJECT_ID: 'bf90c148-e0f8-46ac-9ccd-c947bb8c2e4a',
    CLIENT_KEY: 'cSuaEDxwyRbonAjPGrTZDJTPDwYQUJ4yqc4HryET',
    APP_ID: 'aaf93c07-a10a-420b-99e2-686c125f6e8f',
};

const ProductionEnv = {
    PROJECT_ID: '4ae419ad-9ac8-494a-bd5f-276168f44d8b',
    CLIENT_KEY: 'cPWgNfkacly7D7Y7UrF1u18TTNcxQQ2EIyfM0iAO',
    APP_ID: 'faa97695-6142-433d-aa3f-7fbe554dd2fc',
};

export const EnvData = isProduction ? ProductionEnv : DebugEnv;

const ComboConfig = {
    Chain: ComboTestnet,
    title: 'Particle @ Combo',
    description:
        "COMBO is a leading provider of scaling solutions for Web3 game development. By leveraging the world's top game engine, COMBO is building an open-source, decentralized, game-oriented Layer2 that is accessible to everyone. It aims to maximize the potential of Web3 games by connecting game developers with the entire ecosystem in an efficient, affordable, and secure way.",
    homepage: 'https://combonetwork.io/',
    icon: ComboIcon,
    getScanUrl: (address: string) => {
        return [ComboTestnet.blockExplorerUrl, 'address', address].join('/');
    },
    getBlockExplorerUrl: (txHash: string) => {
        return [ComboTestnet.blockExplorerUrl, 'tx', txHash].join('/');
    },
    finishedText: 'You have finished the quests for Particle x Combo Campaign',
    nftIcon: NftCombo,
};

const ScrollConfig = {
    Chain: ScrollSepolia,
    title: 'Particle @ Scroll',
    description:
        "Scroll is designed by and for Ethereum developers. A swift, reliable and scalable Layer 2 blockchain, Scroll extends Ethereum's capabilities, enabling apps to scale without any surprises. Thanks to bytecode-level compatibility, existing Ethereum apps can migrate onto Scroll as-is, and at a significantly reduced cost.",
    homepage: 'https://scroll.io/',
    icon: ScrollIcon,
    getScanUrl: (address: string) => {
        return [ScrollSepolia.blockExplorerUrl, 'address', address].join('/');
    },
    getBlockExplorerUrl: (txHash: string) => {
        return [ScrollSepolia.blockExplorerUrl, 'tx', txHash].join('/');
    },
    finishedText: 'You have finished the quests for Particle x Scroll Campaign',
    nftIcon: NftScroll,
};

const opBNBConfig = {
    Chain: opBNB,
    title: 'Particle @ opBNB',
    description:
        "opBNB is a high-performance layer-2 solution within the BNB ecosystem, built using the OP Stack. Leveraging its block size of 100M, opBNB's gas fees remain stable and low cost, making it a great solution for widespread adoption across multiple digital environments.",
    homepage: 'https://combonetwork.io/',
    icon: opBNBIcon,
    getScanUrl: (address: string) => {
        return `${opBNB.blockExplorerUrl}/address/${address}`;
    },
    getBlockExplorerUrl: (txHash: string) => {
        return `${opBNB.blockExplorerUrl}/tx/${txHash}`;
    },
    finishedText: 'You have finished the quests for Particle x opBNB Campaign',
    nftIcon: NftBNB,
};

const ConfigMap = {
    [ComboTestnet.id]: ComboConfig,
    [ScrollSepolia.id]: ScrollConfig,
    [opBNB.id]: opBNBConfig,
};

export const CampaignConfig = ConfigMap[getCurrentChainId()];
