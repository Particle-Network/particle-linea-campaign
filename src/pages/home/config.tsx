import Claim from './components/Claim';
import Completed from './components/Completed';
import Follow from './components/Follow';
import Login from './components/Login';
import Swap from './components/Swap';

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
        title: 'Claim tUSDC',
    },
    {
        title: 'Swap tUSDC to tUSDT',
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
        label: 'Claim',
        key: 'claim',
        Component: Claim,
    },
    {
        label: 'Swap',
        key: 'swap',
        Component: Swap,
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
