#!/bin/sh

bucketName1=particle-netowrk-opbnb-mainnet
bucketName2=particle-netowrk-combo-testnet
bucketName3=particle-netowrk-scroll-testnet

sourceDir=./build

timestamp=$(date +%s)

# build & publish
yarn install &&
    echo "\033[32m \nBuild success\n \033[0m" &&
    cp ${sourceDir}/index.html ${sourceDir}/index.html.backup.${timestamp} &&
    ossutilmac64 cp -r -f --exclude "index.html" ${sourceDir}/ oss://${bucketName1}/ &&
    ossutilmac64 cp -r -f --include "index.html*" ${sourceDir}/ oss://${bucketName1}/ &&
    ossutilmac64 cp -r -f --exclude "index.html" ${sourceDir}/ oss://${bucketName2}/ &&
    ossutilmac64 cp -r -f --include "index.html*" ${sourceDir}/ oss://${bucketName2}/ &&
    ossutilmac64 cp -r -f --exclude "index.html" ${sourceDir}/ oss://${bucketName3}/ &&
    ossutilmac64 cp -r -f --include "index.html*" ${sourceDir}/ oss://${bucketName3}/ &&
    echo "\033[32m \nUpload success\n \033[0m" &&
    curl -X POST -H "Content-Type: application/json" \
        -d '{"msg_type":"post","content":{"post":{"zh_cn":{"title":"Campaigns 正式环境","content":[[{"tag":"a","text":"Combo Testnet","href":"https://combo-testnet.particle.network/"},{"tag":"text","text":" | "},{"tag":"a","text":"Scroll Sepolia","href":"https://scroll-testnet.particle.network/"},{"tag":"text","text":" | "},{"tag":"a","text":"opBNB","href":"https://opbnb-mainnet.particle.network/"}]]}}}}' \
        https://open.feishu.cn/open-apis/bot/v2/hook/72300a7e-d346-43d6-a796-a374ad4977b1

