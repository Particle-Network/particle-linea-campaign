/**
 * 本次活动有 3 个链, 分别是: opBNB, ComboTestnet, ScrollSepolia
 * 本地环境: 通过 sessionStorage 来判断
 * 测试环境和线上环境: 通过域名判断
 */

import { ComboTestnet, ScrollSepolia, opBNB } from '@particle-network/chains';
import { Modal, Radio, Space } from 'antd';

const ChainList = [ComboTestnet, ScrollSepolia, opBNB];

const isDevelopment = Boolean(window.location.port);

const ChainIdKey = 'UserSelectChainId';

const chainId = Number(window.sessionStorage.getItem(ChainIdKey));

const ChainSelect = () => {
    const onChange = (e: any) => {
        const { value } = e.target;
        window.sessionStorage.setItem(ChainIdKey, value);
        window.location.reload();
    };
    return (
        <Radio.Group onChange={onChange} defaultValue={chainId}>
            <Space direction="vertical">
                {ChainList.map((v) => {
                    const { id, fullname } = v;
                    return (
                        <Radio value={id} key={id}>
                            {fullname}
                        </Radio>
                    );
                })}
            </Space>
        </Radio.Group>
    );
};

export const showChainSelector = () => {
    Modal.error({
        title: '请选择你开发的活动所属的链',
        content: <ChainSelect />,
        keyboard: false,
        okButtonProps: {
            style: {
                display: 'none',
            },
        },
    });
};

if (isDevelopment) {
    if (!ChainList.map((v) => v.id).includes(Number(chainId))) {
        showChainSelector();
    }
}

export const getCurrentChainId = () => {
    // 根据域名判断
    if (!isDevelopment) {
        const { host } = window.location;
        if (host.includes('combo')) {
            document.title = ['Particle ❤', ComboTestnet.name, 'Chain'].join(' ');
            return ComboTestnet.id;
        }
        if (host.includes('scroll')) {
            document.title = ['Particle ❤', ScrollSepolia.name, 'Chain'].join(' ');
            return ScrollSepolia.id;
        }
        if (host.includes('opbnb')) {
            document.title = ['Particle ❤', opBNB.name, 'Chain'].join(' ');
            return opBNB.id;
        }
        throw new Error('未知域名');
    }
    document.title = ['Particle ❤', getCurrentChainName(), 'Chain'].join(' ');
    if (!ChainList.map((v) => v.id).includes(Number(chainId))) {
        return ChainList[0].id;
    }
    return chainId;
};

export const getCurrentChainName = () => {
    const currentChain = ChainList.find((v) => v.id === chainId);
    return currentChain?.name ?? '';
};
