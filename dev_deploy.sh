#!/bin/sh

SRC=./build
DEST=magellan@magellan-debug:/data/code/campaigns-web/opbnb-mainnet/

yarn \
    && yarn build \
    && echo "Build success" \
    && rsync --timeout=60 -avzP ${SRC}/* ${DEST} \
    && echo "Upload success" \
    && curl -X POST -H "Content-Type: application/json" \
        -d '{"msg_type":"post","content":{"post":{"zh_cn":{"title":"opBNB Mainnet Campaign 测试环境","content":[[{"tag":"text","text":"项目有更新: "},{"tag":"a","text":"请查看","href":"https://opbnb-mainnet-debug.particle.network/"}]]}}}}' \
        https://open.feishu.cn/open-apis/bot/v2/hook/72300a7e-d346-43d6-a796-a374ad4977b1
