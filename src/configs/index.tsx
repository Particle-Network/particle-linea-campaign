import ComboIcon from '@/assest/images/Combo.png';
import NftBNB from '@/assest/images/NftBNB.png';
import NftCombo from '@/assest/images/NftCombo.png';
import NftScroll from '@/assest/images/NftScroll.png';
import ScrollIcon from '@/assest/images/Scroll.png';
import opBNBIcon from '@/assest/images/opBNB.png';
import { ComboTestnet, ScrollSepolia, opBNB } from '@particle-network/chains';
import { getCurrentChainId } from './chain';

const isDevelopment = Boolean(window.location.port);

const isDebug = window.location.host.includes('debug');

const isProduction = !isDevelopment && !isDebug;

window.__PARTICLE_ENVIRONMENT__ = isProduction ? 'production' : 'development';

const DebugEnv = {
    [opBNB.id]: {
        PROJECT_ID: 'ce4e094f-49e7-478d-8ae8-8c749e43cd6a',
        CLIENT_KEY: 'cFSixa1sZgubkIXU0Dx7EKViYIeadYm5OGQufru2',
        APP_ID: 'd112f2ef-7bf1-49a7-befa-f8ef6288872c',
    },

    [ComboTestnet.id]: {
        PROJECT_ID: '7ae78c8a-0358-42ff-9f3c-d79d0e5b325a',
        CLIENT_KEY: 'cAwXhxfGQ5ABPkgU3TZ9tayimrGfSpw8SiDP2pVa',
        APP_ID: 'f638d509-0419-4e20-9c6f-833df32cd50c',
    },

    [ScrollSepolia.id]: {
        PROJECT_ID: '11fc3744-3778-4bbf-ae66-b67587d4df5f',
        CLIENT_KEY: 'cpKhY3E7S6LKTf0u3Ine8iAQc0XdXGgTqAOsYQXD',
        APP_ID: '1cdffd9a-03a7-4ed9-ae14-dc9715fb029b',
    },
};

const ProductionEnv = {
    [opBNB.id]: {
        PROJECT_ID: '6f1d6acc-e87e-4b51-b761-2b8278922717',
        CLIENT_KEY: 'cO7xwHGSiIo8qkGxy0RxUS9egUMuyPeEvHIyASdl',
        APP_ID: 'd2034ee7-f532-4b9b-b208-ffdbbce6561a',
    },
    [ComboTestnet.id]: {
        PROJECT_ID: 'e1551846-9cd4-4c52-9016-8814effe2f39',
        CLIENT_KEY: 'c6x3op9eujQ4sWZgiy79Q7I7WR3FuzTnHZsNM5QL',
        APP_ID: 'ef78228f-6918-41ea-b148-5d0b2a573c16',
    },
    [ScrollSepolia.id]: {
        PROJECT_ID: '769f1bd0-f918-433f-8dc9-ce5ad360357e',
        CLIENT_KEY: 'cKEGkIzUYutcckiU6D7H7WCVpZPsybqdFsyj4dWp',
        APP_ID: '5c23e535-b3f6-4797-a6f1-3975e15298d4',
    },
};

export const BundlerApiPrefix = ['https://', isProduction ? 'bundler' : 'bundler-debug', '.particle.network'].join('');

export const PaymasterApiPrefix = [
    'https://',
    isProduction ? 'paymaster' : 'paymaster-debug',
    '.particle.network',
].join('');

export const EnvData = (isProduction ? ProductionEnv : DebugEnv)[getCurrentChainId()];

const ComboConfig = {
    ConstractAddress: '0x5bA7C86EEc21eCC5C5edBb720e4A52c851F7e2a6',
    Chain: ComboTestnet,
    title: 'Particle @ COMBO',
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
    CampaignLink: 'https://galxe.com/ParticleNetwork/campaign/GCLJmUBPYg',
};

const ScrollConfig = {
    ConstractAddress: '0xC1C4aa02F5B65D1A885eC5cC03B39598047390eB',
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
    CampaignLink: 'https://galxe.com/ParticleNetwork/campaign/GCVcLUH9fe',
};

const opBNBConfig = {
    ConstractAddress: '0xC1C4aa02F5B65D1A885eC5cC03B39598047390eB',
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
    CampaignLink: 'https://galxe.com/ParticleNetwork/campaign/GCorLUHaZn',
};

const ConfigMap = {
    [ComboTestnet.id]: ComboConfig,
    [ScrollSepolia.id]: ScrollConfig,
    [opBNB.id]: opBNBConfig,
};

export const CampaignConfig = ConfigMap[getCurrentChainId()];
