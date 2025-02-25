const { default: axios } = require("axios");
const { Controllers } = require("../controllers/controller");
const createHttpError = require("http-errors");
const { V2RAY_API_URL, V2RAY_USERNAME, V2RAY_PASSWORD } = process.env
const qs = require('qs');
const cache = require("../utils/cache");
const { copyObject } = require("../utils/functions");
const cookie = () => {
    const V2RAY_TOKEN = cache.get("token")
    return {
        withCredentials: true,
        headers: {
            'Cookie': V2RAY_TOKEN
        }
    }
}
class xrayService extends Controllers {
    async getXraySetting() {
        try {
            const xraySetting = (await axios.post(`${V2RAY_API_URL}/panel/xray`, {}, cookie())).data.obj
            const parsedSetting = JSON.parse(xraySetting)
            const result = {
                setting: parsedSetting.xraySetting,
                tags: parsedSetting.inboundTags
            }
            return result
        } catch (error) {
            throw error
        }
    }
    async addInboundToTunnel(tag="") {
        try {
            const xraySetting = await this.getXraySetting()
            if(!xraySetting.tags.includes(tag)) return Error("xray: port not exist") 
                
            const copiedSettings = copyObject(xraySetting.setting)
            copiedSettings.routing.rules[3].inboundTag.push(tag)
            const strXraySetting = JSON.stringify(copiedSettings, null, 2);

            const updateXrayResult = await this.updateXraySetting({xraySetting: strXraySetting})
            return updateXrayResult.success
        } catch (error) {
            throw error
        }
    }
    async deleteInboundToTunnel(tag="") {
        try {
            const xraySetting = await this.getXraySetting()
            if(!xraySetting.tags.includes(tag)) return Error("xray: port not exist") 
            let ss =['11', '2', '3']
            ss = ss.filter(s => s !== '3')
            console.log(ss);
            
            const copiedSettings = copyObject(xraySetting.setting)
            let inboundTags = copiedSettings.routing.rules[3].inboundTag
            inboundTags = inboundTags.filter(tg => tg !== tag)
            // lo
            copiedSettings.routing.rules[3].inboundTag = inboundTags
            const strXraySetting = JSON.stringify(copiedSettings, null, 2);

            const updateXrayResult = await this.updateXraySetting({xraySetting: strXraySetting})
            return updateXrayResult.success
        } catch (error) {
            throw error
        }
    }
    
    async updateXraySetting(data){
        try {
            const V2RAY_TOKEN = cache.get("token")
            const updateResult = (await axios.post(`${V2RAY_API_URL}/panel/xray/update`, data, {
                withCredentials: true,
                headers: {
                    'Cookie': V2RAY_TOKEN,
                    'Content-Type': 'multipart/form-data'
                }
            })).data
            return updateResult
        } catch (error) {
            throw error
        }
    }
    async checkExistTag(inboundTag){
        try {
            const tags = await this.getXraySetting()
            const result = tags.filter(tag => tag === inboundTag)
            return !!result.length
        } catch (error) {
            throw error
        }
    }
    
}

module.exports = {
    xrayService: new xrayService()
}