import { Ed25519Keypair, JsonRpcProvider, RawSigner, Network, SuiJsonValue } from '@mysten/sui.js';
import bip39 from 'bip39'
import axios from 'axios'
import HttpsProxyAgent from 'https-proxy-agent';
import fs from 'fs';
import stream from 'stream'
import util from 'util'
import consoleStamp from 'console-stamp';
import call from 'console-stamp';
import { v4 as uuidv4 } from 'uuid';
import { isBigUint64Array } from 'util/types';

consoleStamp(console, { format: ':date(HH:MM:ss)' });

const STAKIN_ADDRESSES = [
    '0x47fd0740af34c4a0637c5b7970bab029c7fdf148',
    '0x8ffe1349c12c596a38b65800d2d98c9db0e38094',
    '0xa2ea08f0fe3f1f21c1c626c55066ae25595ed88d',
    '0x4181c06a69bb95161ea90fe1b23cb68bc2cf8aa7',
    '0xda387ddcb33ff7dfa4617a5668e99f7b95200d31',
    '0x6c374763cdbf4fc6b7397a5c90ef8bca431382e2',
    '0x4f4334b57f762b7255a924537680e4d09410878f',
    '0xaa10cfd6e38c4cf3ea1f7a99bd7c75b0a3d3f4c8',
    '0x07a3d48f2686399ca504d0b625f62761d9ef2db1',
    '0x9fbad25517db8a282f7a79bb9134e882d2045d4d',
    '0x3d6840586afe597a77cf4d89134c3ad00d75ccad',
    '0xd6859aeee42810b0e07cc62211b1d6dd7ed955e1',
    '0x049950270c3f899ad734cba5027cbbf411199b6d',
    '0x2c530836f1d1629e93be4b3c17afe49222986e4e',
    '0x409d52befdeeae83bd669236850a159d6d231c9a',
    '0xfdc2a0fe740d34e5424d1a06c0c4ac106b7096f2',
    '0x2cfb19b03b58b05f1ea073dcffb76eb084bf8aac',
    '0xe71c92078bea4c3693cb5a82b6227552822b4924',
    '0x0018bb48352b63c246bdb154b15a3b0d17dff193',
    '0xb0719855f1c3c4a6dbbc08b9eb4bfaa529e6f646',
    '0x70bdad20a4fc118df8d7fd6085d3385b9f7a22e3',
    '0xf30ba97931bedac27ca0ea54aeb1abae748e62ed',
    '0x3c8b8c8c5d3db783886a1a0a1921db26e63ac272',
    '0xc75fcfa8e93f9c09cd63b6606985dbde98e72cdf',
    '0xd4f166363b2b0dc74e44e6e23100c1d2e3210e3c',
    '0xa3b1b472f6c6f600fb244c8e78fd32df6d705512',
    '0x48f9c8662045805d9d98faf3e8d58d6251718a22',
    '0xb049fc87c6a3903a336c171e2e99106010646f31',
    '0x63a03820bafde3535d2b1dd49dc8c3b0e4812553',
    '0x2aee191029bc482e1a685cde2c0fed6532d6cec1',
    '0x0f58ef0a8a5ca582ee16b6a8ced07efa1eac4092',
    '0xa8e6b7ab1c2e6098c7056e2ecd2041cf0e04ffc0',
    '0x98987d782154c32f97a1717eadd38897cb4b3ba0',
    '0x5d06f37654f11cdd27179088fcfeadaab21e13ef',
    '0x0dfc80a642b711d1d8ff44a808e115f6bc302919',
    '0x05eac33a7c45b9fb1f20c33500a307e7713f33e0',
    '0x73ac343351ba71ebd9ef44bcf62e001aa5912862',
    '0x5b41528f7fd8aa2a5077511ade6b7ea32bc928c3',
    '0xc397cc2c83165c78a850a0295fb08538de9566f1'
]

const getRandomStakingAddress = () => STAKIN_ADDRESSES[Math.floor(Math.random() * STAKIN_ADDRESSES.length)]
const getRandomStakingSum = () => [String((9000 + Math.floor(Math.random() * 2000)))]
const getRandomStakingSumObj = () => (10900 + Math.floor(Math.random() * 200))

const timeout = ms => new Promise(res => setTimeout(res, ms))
const provider = new JsonRpcProvider('https://sui-api.rpcpool.com/')
// const provider = new JsonRpcProvider('https://fullnode.testnet.sui.io')
const mnemonicFile = "mnemonics/mnemonicsBase.txt"
const mnemonicFileTmp = "mnemonicsBase_.txt"

var Transform = stream.Transform;

const nftArray = [[
    'Example NFT',
    'An NFT created by Sui Wallet',
    'ipfs://QmZPWWy5Si54R3d26toaqRiqvCH7HkGdXkxwUgCm2oKKM2?filename=img-sq-01.png',
]]

async function sendToken(signer, receiverAddress, accBal, amountToSent) {
    console.log(`sending..`)
    let objectId = accBal[0].address
    let objectId1 = accBal[1].address
    // console.log(`sending..33`)
    // console.log(`objId ${objectId}`)
    // let recipient = `0x${receiverAddress}`
    // console.log(`sending..4`)
    let r = await signer.paySui({
        inputCoins: [objectId, objectId1],
        recipients: [receiverAddress, receiverAddress],
        amounts: [amountToSent, getRandomStakingSumObj()],
        gasBudget: 1000
    })
    // console.log(`sending..5`)
    const transactionDigest = r.EffectsCert.certificate.transactionDigest
    console.log('transactionDigest', transactionDigest);
}

function parseFile(file) {
    let data = fs.readFileSync(file, "utf8");
    let array = data.split('\n').map(str => str.trim());
    const proxyRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})@(\w+):(\w+)/;
    let proxyLists = [];

    array.forEach(proxy => {
        if (proxy.match(proxyRegex)) {
            proxyLists.push({ "ip": `http://${proxy.split("@")[1]}@${proxy.split("@")[0]}`, "limited": false, "authFailed": false })
        }
    })

    return proxyLists
}

function saveMnemonic(mnemonic) {
    fs.appendFileSync("mnemonics/mnemonicsDone.txt", `${mnemonic}\n`, "utf8");
}

function saveMnemonicError(mnemonic) {
    fs.appendFileSync("mnemonics/mnemonicsError.txt", `${mnemonic}\n`, "utf8");
}

async function checkProxy(proxyList) {
    let checkedProxy = await Promise.all(proxyList.map(async (proxy) => {
        let axiosInstance = axios.create({ httpsAgent: HttpsProxyAgent(proxy.ip) })
        await axiosInstance.get("https://api64.ipify.org/?format=json")
            .catch(err => {
                console.log(`Proxy ${proxy.ip.split("@")[1]} check error: ${err?.response?.statusText}`)
                switch (err?.response?.status) {
                    case 407: proxy.authFailed = true;
                    case 429: proxy.limited = true;
                }
            });
        return proxy
    }))

    return checkedProxy.filter((proxy) => !proxy.limited && !proxy.authFailed);
}

async function mintNft(signer, args) {
    console.log(`Minting: ${args[1]}`);

    return await signer.executeMoveCall({
        packageObjectId: '0x2',
        module: 'devnet_nft',
        function: 'mint',
        typeArguments: [],
        arguments: args,
        gasBudget: 10000,
    })
}

async function registerFrenemies(signer) {
    console.log(`registerFrenemies`);

    let length = Math.floor(Math.random() * 6) + 6

    const name = uuidv4().slice(0, length)
    console.log(`name ${name}`)

    const argumentsArray = [
        name,
        '0xc42531c558ded8fcfecb0b0a4b479d9efb14af67',
        '0x5',
    ]

    let data = await signer.executeMoveCall({
        packageObjectId: '0xac02d650b50456147c2c055c68acac7c545de0a7',
        module: 'frenemies',
        function: 'register',
        typeArguments: [],
        arguments: argumentsArray,
        gasBudget: 15000,
    })
    // return data.EffectsCert.effects.effects.events.find(i => i.moveEvent).moveEvent.fields.id
}


async function getNftId(address) {
    const objects = await provider.getObjectsOwnedByAddress(address);
    console.log(`address ${address}`)
    for (let object of objects) {
        console.log(`type ${object.type}`)
        if (object.type == '0xac02d650b50456147c2c055c68acac7c545de0a7::frenemies::Scorecard') {
            return object.objectId
        }
    }
}

async function getNftIdNew(address) {
    const objects = await provider.getObjectsOwnedByAddress(address);
    console.log(`address ${address}`)
    for (let object of objects) {
        console.log(`type ${object.type}`)
        if (object.type == '0x436dfcc34d299f3ad41a3429da4b66f2e627db84::frenemies::Scorecard') {
            return object.objectId
        }
    }
}

async function updateLeaderboard(signer, address) {
    console.log(`updateLeaderboard`);

    const argumentsArray = [
        await getNftId(address),
        '0xeaeffb5eea6b206b1f7a1129771b06818e3d79e4',
    ]

    let data = await signer.executeMoveCall({
        packageObjectId: '0x436dfcc34d299f3ad41a3429da4b66f2e627db84',
        module: 'frenemies',
        function: 'migrate',
        typeArguments: [],
        arguments: argumentsArray,
        gasBudget: 10000,
    })
}

async function nextFrenemies(signer, address) {
    console.log(`nextFrenemies`);

    const argumentsArray = [
        await getNftIdNew(address),
        '0x5',
        '0x3b687296398b01a4054c44a552375fc988992c22',
    ]

    let data = await signer.executeMoveCall({
        packageObjectId: '0x436dfcc34d299f3ad41a3429da4b66f2e627db84',
        module: 'frenemies',
        function: 'update',
        typeArguments: [],
        arguments: argumentsArray,
        gasBudget: 40000,
    })
}


async function stake(proxy, signer, address) {
    console.log(`stake`);

    const axiosInstance = axios.create({ httpsAgent: HttpsProxyAgent(proxy.ip) })

    let objectIdForStaking;
    let isError = false

    const msgId = uuidv4()
    let res = await axiosInstance.post("https://fullnode.testnet.sui.io/sui_getObjectsOwnedByAddress", {
        method: "sui_getObjectsOwnedByAddress",
        jsonrpc: "2.0",
        params: [
            address
        ],
        id: msgId
    })
    .then((response) => {
        const result = response.data.result;
        const filteredResult = result.filter(objResult => objResult.type == '0x2::coin::Coin<0x2::sui::SUI>')
        console.log(`filteredResult ${filteredResult.length}`)
        if (filteredResult.length > 0) {
            objectIdForStaking = filteredResult[filteredResult.length - 1].objectId
        }
        console.log(`objectIdForStaking ${objectIdForStaking}`)
    })
    .catch(async err => {
        console.log('Get secret id error:', err)
        isError = true
    })
    if (isError) {
        await timeout(3000)
        return false
    }
    const argumentsArray = [
        '0x5',
        [objectIdForStaking],
        getRandomStakingSum(),
        getRandomStakingAddress(),
    ]
    await signer.executeMoveCall({
        packageObjectId: '0x2',
        module: 'sui_system',
        function: 'request_add_delegation_mul_coin',
        typeArguments: [],
        arguments: argumentsArray,
        gasBudget: 13000,
    })
    return true
}

async function getNextMnemonic() {
    let data = fs.readFileSync(mnemonicFile, "utf8");
    let array = data.split('\n').map(str => str.trim());
    return array[0]
}

// Transform sctreamer to remove first line
function RemoveFirstLine(args) {
    if (! (this instanceof RemoveFirstLine)) {
        return new RemoveFirstLine(args);
    }
    Transform.call(this, args);
    this._buff = '';
    this._removed = false;
}
util.inherits(RemoveFirstLine, Transform);

RemoveFirstLine.prototype._transform = function(chunk, encoding, done) {
    if (this._removed) { // if already removed
        this.push(chunk); // just push through buffer
    } else {
        // collect string into buffer
        this._buff += chunk.toString();

        // check if string has newline symbol
        if (this._buff.indexOf('\n') !== -1) {
            // push to stream skipping first line
            this.push(this._buff.slice(this._buff.indexOf('\n') + 1));
            // clear string buffer
            this._buff = null;
            // mark as removed
            this._removed = true;
        }
    }
    done();
};

async function removeLine() {
    var input = fs.createReadStream(mnemonicFile); // read file
    var output = fs.createWriteStream(mnemonicFileTmp); // write file

    input // take input
        .pipe(RemoveFirstLine()) // pipe through line remover
        .pipe(output); // save to file
}

const generateRandomAmount = (min, max) => Math.random() * (max - min) + min;
const getRandomAmountToSend = () => (generateRandomAmount(0.0211, 0.02110001).toFixed(7) * 1000000000)

async function getAccountBalances(address) {
    console.log(`data---`)
    const data = await provider.getCoins(
        address,
        '0x2::sui::SUI'
    )
    console.log(`data ${data.data.length}`)
    let arr = data.data.map(obj => ({
        address: obj.coinObjectId,
        balance: obj.balance
    }))
    console.log(`arr ${arr.length}`)
    return arr.sort((a, b) => b.balance - a.balance)
}

(async () => {
    while(true) {
        let errorLimit = 25
        let errorCount = 0
        let proxyList = parseFile('proxy.txt');
        console.log(`Found ${proxyList.length} proxies`);
        let validProxy = await checkProxy(proxyList);
        validProxy.length == proxyList.length ? console.log('All proxies are valid') : console.log(`Valid ${validProxy.length}/${proxyList.length} proxies`);

        if (validProxy.length > 0) {
            while (validProxy.every(proxy => !proxy.limited)) {
                for (let i = 0; i < validProxy.length; i++) {
                    let mnemonic
                    try {
                        mnemonic = await getNextMnemonic()
                        const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
                        const address = keypair.getPublicKey().toSuiAddress()
                        const proxy = validProxy[i]


                        errorCount = 0
                        console.log(`Sui Address: 0x${address}`)
                        console.log(`Mnemonic: ${mnemonic}`);
                        const signer = new RawSigner(keypair, provider);    

                        // const result = await stake(proxy, signer, address)   

                        /////
                        let needSend = true
                        let errorInCycle = false
                        while(needSend) {
                            const longTask = () => new Promise(async resolve => {
                                try {
                                    // let accBal = await getAccountBalances(address)
                                    // // console.log(`accBal ${accBal.length}`)
                                    // await sendToken(signer, address, accBal, getRandomAmountToSend())
                                    let result = await stake(proxy, signer, address)   
                                    if (result) {
                                        resolve("success")
                                    } else {
                                        resolve("error")
                                    }
                                    // await registerFrenemies(signer)
                                    // await updateLeaderboard(signer, address)
                                    // await timeout(100)
                                    // await nextFrenemies(signer, address)
                                    //resolve("success")
                                } catch (err) {
                                    console.log(err.message);
                                    resolve("error")
                                }
                            })
                            
                            const timeout = (cb, interval) => () =>
                                new Promise(resolve => setTimeout(() => cb(resolve), interval))
                            
                            const onTimeout = timeout(resolve =>
                                resolve("timeout"), 350000)

                            let result1 = await Promise.race([longTask, onTimeout].map(f => f()))
                            
                            if (result1 == 'error') {
                                errorInCycle = true
                                break
                            } else if (result1 == 'timeout') {
                                console.log(`=======> TIMEOUT HAPPENED`)
                                needSend = true
                            } else {
                                needSend = false
                            }
                        }

                        ///


                        if (!errorInCycle) {        
                            await removeLine()
                            await timeout(500)  
                            fs.unlinkSync(mnemonicFile)     
                            await timeout(100)       
                            fs.renameSync(mnemonicFileTmp, mnemonicFile)   
                            saveMnemonic(mnemonic);
                            await timeout(100)
                            console.log(`Result: https://explorer.sui.io/addresses/${address}?network=testnet`);
                            // await timeout(100000)
                        } else {
                            errorCount++

                            await removeLine()
                            await timeout(500)  
                            fs.unlinkSync(mnemonicFile)     
                            await timeout(100)       
                            fs.renameSync(mnemonicFileTmp, mnemonicFile)   
                            saveMnemonicError(mnemonic);
                            await timeout(100)

                            console.log(`ERROR1`);
                            // await timeout(100000)
                        }

                        for (let i = 0; i < nftArray.length; i++) {
                             // await mintNft(signer, nftArray[i])
                        }
                    } catch (err) {
                        errorCount++

                        await removeLine()
                        await timeout(500)  
                        fs.unlinkSync(mnemonicFile)     
                        await timeout(100)       
                        fs.renameSync(mnemonicFileTmp, mnemonicFile)   
                        saveMnemonicError(mnemonic);
                        await timeout(100)
                        console.log(`ERRORRRR`);

                        console.log(err.message);
                        // await timeout(100000)
                    }
                    console.log("-".repeat(100));
                    if (errorCount >= errorLimit) {
                        console.log("error limit reached1");
                        break
                    }
                }
                if (errorCount >= errorLimit) {
                    console.log("error limit reached1");
                    break
                }
            }
        } else {
            console.log('No working proxies found, please make sure the proxy is in the correct format');
        }
        if (errorCount >= errorLimit) {
            console.log(">>>BREAK<<<<");
            await timeout(3960000)
        }
    }
})()