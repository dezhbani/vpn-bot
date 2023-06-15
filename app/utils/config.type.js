const { randomNumber, randomString, configExpiryTime } = require("./functions");
const { v4: uuidv4 } = require('uuid');

const createVless = async (lastID, plan, fullName) => {
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

module.exports = {
    createVless,
    createVmess
}