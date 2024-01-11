// const { randomNumber, randomString } = require("./functions");
const { v4: uuidv4 } = require('uuid');
const { V2RAY_API_URL } = process.env

const configExpiryTime = month => {
    const expiryTime = new Date()
    expiryTime.setMonth(expiryTime.getMonth() + month)
    expiryTime.setDate(expiryTime.getDate()) 
    expiryTime.setHours(23)
    expiryTime.setMinutes(59)
    expiryTime.setSeconds(0)
    expiryTime.setMilliseconds(0)
    console.log(expiryTime.getTime());
    return expiryTime.getTime()
}
const randomString = () => {
    const random = Math.random().toString(36).substring(2, 8);
    return random
}
function randomNumber(){
    return Math.floor((Math.random() * 90000) + 10000)
}

const createVlessKcp = async (lastID, plan, fullName) => {
    const expiryTime = +configExpiryTime(plan.month);
    const id = uuidv4();
    const email = `${randomString()}@x-ui-english.dev`;;
    const port = randomNumber();
    const password = randomString()
    const name = fullName.replace(/\s/g, '%20')
    const dataSize = (+plan.data_size) * 1024 * 1024 * 1024
    const streamSettingsObj = {
        network: 'kcp',
        security: 'none',
        kcpSettings: {
          mtu: 1350,
          tti: 20,
          uplinkCapacity: 5,
          downlinkCapacity: 20,
          congestion: false,
          readBufferSize: 2,
          writeBufferSize: 2,
          header: { type: 'none' },
          seed: password
        }
    };
    const settingsObj = {
        clients: [
          {
            id,
            flow: 'xtls-rprx-direct',
            email,
            limitIp: plan.user_count,
            totalGB: dataSize,
            expiryTime,
          },
        ],
        decryption: 'none',
        fallbacks: []
    };
    const sniffingObj = { 
        enabled: true, 
        destOverride: [ 'http', 'tls' ] 
    };
    const sniffing = JSON.stringify(sniffingObj)
    const settings = JSON.stringify(settingsObj)
    const streamSettings = JSON.stringify(streamSettingsObj)
    const details = {
        id: lastID,
        total: dataSize,
        remark: fullName,
        enable: true,
        expiryTime,
        clientStats: [],
        listen: "",
        port,
        protocol: "vless",
        settings,
        streamSettings,
        tag: `inbound-${randomNumber()}`,
        sniffing
    };
    const configContent = `vless://${id}@s1.delta-dev.top:${port}?type=kcp&security=none&headerType=none&seed=${password}#${name}`
    const obj = { details, configContent, id }
    return obj
}
const createVlessTcp = async (lastID, plan, fullName) => {
    const expiryTime = +configExpiryTime(plan.month);
    const id = uuidv4();
    const email = `${randomString()}@x-ui-english.dev`;;
    const port = randomNumber();
    const password = randomString()
    const name = fullName.replace(/\s/g, '%20')
    const dataSize = (+plan.data_size) * 1024 * 1024 * 1024
    const streamSettingsObj = {
        network: 'tcp',
        security: 'none',
        tcpSettings: {
            acceptProxyProtocol: false,
            header: {
                type: "http",
                request: {
                    method: "GET",
                    path: [
                        "/"
                    ],
                    headers: {
                        Host: [
                        "digikala.com"
                    ]
                    }
                },
                response: {
                    version: "1.1",
                    status: "200",
                    reason: "OK",
                    headers: {}
                }
            }
        }
    };
    const settingsObj = {
        clients: [
          {
            id,
            flow: 'xtls-rprx-direct',
            email,
            limitIp: plan.user_count,
            totalGB: dataSize,
            expiryTime,
          },
        ],
        decryption: 'none',
        fallbacks: []
    };
    const sniffingObj = { 
        sniffing: {
            enabled: true,
            destOverride: [
                "http",
                "tls"
            ]
        }
    };
    const sniffing = JSON.stringify(sniffingObj)
    const settings = JSON.stringify(settingsObj)
    const streamSettings = JSON.stringify(streamSettingsObj)
    const details = {
        id: lastID,
        total: dataSize,
        remark: fullName,
        enable: true,
        expiryTime,
        clientStats: [],
        listen: "",
        port,
        protocol: "vless",
        settings,
        streamSettings,
        tag: `inbound-${randomNumber()}`,
        sniffing
    };
    const configContent = `vless://${id}@${V2RAY_API_URL}:${port}?type=Tcp&security=none&headerType=http&seed=${password}#${name}`
    const obj = { details, configContent, id }
    return obj
}
const createVmess = () => {
    const streamSettingsObj = {
        network: 'kcp',
        security: 'none',
        kcpSettings: {
            mtu: 1350,
            tti: 20,
            uplinkCapacity: 5,
            downlinkCapacity: 20,
            congestion: false,
            readBufferSize: 2,
            writeBufferSize: 2,
            header: { type: 'none' },
            seed: 'EVWiCLAlFU'
        }
    }
    const settingsObj = {
        clients: [
            {
                id,
                flow: 'xtls-rprx-direct',
                email,
                limitIp: +userCount,
                totalGB: +plan.total,
                expiryTime,
            },
        ],
        decryption: 'none',
        fallbacks: []
    };
    const sniffingObj = { 
        enabled: true, 
        destOverride: [ 'http', 'tls' ] 
    };
    const sniffing = JSON.stringify(sniffingObj)
    const settings = JSON.stringify(settingsObj)
    const streamSettings = JSON.stringify(streamSettingsObj)
    const details = {
        id: lastConfigID,
        total: +total,
        remark: remark,
        enable: true,
        expiryTime,
        clientStats: [],
        listen: "",
        port: randomNumber(),
        protocol: "vless",
        settings,
        streamSettings,
        tag: `inbound-${randomNumber()}`,
        sniffing
    };
    return details
}
// vless://c4cf9b5f-78b8-4a70-abc7-162299fbeff3@s3.delta-dev.top:17047?type=tcp&security=none&path=%2F&host=digikala.com&headerType=http#matin%20dezhbani
module.exports = {
    createVlessKcp,
    createVmess
}