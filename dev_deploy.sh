#!/bin/sh

SRC=./build

DEST1=magellan@magellan-debug:/data/code/campaigns-web/opbnb-mainnet/
DEST2=magellan@magellan-debug:/data/code/campaigns-web/combo-testnet/
DEST3=magellan@magellan-debug:/data/code/campaigns-web/scroll-sepolia/

yarn \
    && yarn build \
    && node updateTitle opBNB \
    && rsync --timeout=60 -avzP ${SRC}/* ${DEST1} \
    && node updateTitle Combo \
    && rsync --timeout=60 -avzP ${SRC}/* ${DEST2} \
    && node updateTitle Scroll \
    && rsync --timeout=60 -avzP ${SRC}/* ${DEST3} \
    && echo "Upload success" \
    && curl -X POST -H "Content-Type: application/json" \
        -d '{"msg_type":"post","content":{"post":{"zh_cn":{"title":"Campaigns 测试环境","content":[[{"tag":"a","text":"Combo Testnet","href":"https://combo-testnet-debug.particle.network/"},{"tag":"text","text":" | "},{"tag":"a","text":"Scroll Sepolia","href":"https://scroll-testnet-debug.particle.network/"},{"tag":"text","text":" | "},{"tag":"a","text":"opBNB","href":"https://opbnb-mainnet-debug.particle.network/"}]]}}}}' \
        https://open.feishu.cn/open-apis/bot/v2/hook/72300a7e-d346-43d6-a796-a374ad4977b1
