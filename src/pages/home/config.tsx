import Completed from './components/Completed';
import Follow from './components/Follow';
import Login from './components/Login';
import Mint from './components/Mint';
import Transfer from './components/Transfer';

export const ComponentHeight = 490;

export const SpringSettings = { stiffness: 170, damping: 26 };

export const isDevelopment = !!window.location.port;

export const StepsItems = [
    {
        title: 'Follow Particle Twitter',
    },
    {
        title: 'Connect with Particle',
    },
    {
        title: 'Gasless Mint NFT',
    },
    {
        title: 'Gasless Transfer NFT',
    },
    {
        title: 'Completed',
    },
];

export const ComponentItems = [
    {
        label: 'Follow',
        key: 'follow',
        Component: Follow,
    },
    {
        label: 'Connect',
        key: 'connect',
        Component: Login,
    },
    {
        label: 'Mint',
        key: 'mint',
        Component: Mint,
    },
    {
        label: 'Transfer',
        key: 'transfer',
        Component: Transfer,
    },
    {
        label: 'Completed',
        key: 'completed',
        Component: Completed,
    },
];

// 获取 Twitter 关注的链接
export const getTwitterFollowUrl = (username = 'ParticleNtwrk') => {
    const prefix = 'https://twitter.com/intent/follow';
    const suffix = encodeURIComponent('^tfw|twcamp^buttonembed|twterm^follow|twgr^');
    return `${prefix}?screen_name=${username}&${suffix}`;
};
