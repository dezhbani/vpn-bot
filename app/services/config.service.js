const { default: axios } = require("axios");
const { Controllers } = require("../controllers/controller");
const createHttpError = require("http-errors");
const { copyObject, stringifyProperties } = require("../utils/functions");
const { V2RAY_API_URL, V2RAY_TOKEN, V2RAY_USERNAME, V2RAY_PASSWORD } = process.env

const cookie = {
    withCredentials: true,
    headers: {
        'Cookie': V2RAY_TOKEN
    }
}
class configService extends Controllers {
    async loginPanel() {
        const data = {
            username: V2RAY_USERNAME,
            password: V2RAY_PASSWORD
        }
        const result = await axios.post(`${V2RAY_API_URL}/login`, data)
        const cookie = result.headers["set-cookie"][1].split(';')[0];
        return cookie
    }
    async getConfigs() {
        try {
            const configs = (await axios.get(`${V2RAY_API_URL}/panel/api/inbounds/list`, cookie)).data.obj
            return configs
        } catch (error) {
            throw error
        }
    }
    async getConfig(configID) {
        try {
            const configs = await this.getConfigs()
            const config = configs.filter(config => JSON.parse(config.settings).clients[0].id == configID);
            return config[0]
        } catch (error) {
            return error
        }
    }
    async addConfig(data, defaultData = true, customeData) {
        try {
            let addResult = (await axios.post(`${V2RAY_API_URL}/panel/api/inbounds/add`, data, cookie)).data
            console.log(addResult);
            

            // let addResult
            // if (defaultData) addResult = (await axios.post(`${V2RAY_API_URL}/panel/api/inbounds/add`, data, cookie)).data
            // else {
            //     const { url, token } = customeData
            //     const cookie = {
            //         withCredentials: true,
            //         headers: {
            //             'Cookie': token
            //         }
            //     }
            //     addResult = (await axios.post(`${url}/panel/api/inbounds/add`, data, cookie)).data
            // }
            return addResult
        } catch (error) {
            throw error
        }
    }
    async editConfig(data, defaultData = true, customeData) {
        try {
            let addResult = (await axios.post(`${V2RAY_API_URL}/panel/api/inbounds/update/${data.id}`, data, cookie)).data
            console.log(addResult);
            
            // if (defaultData) addResult = (await axios.post(`${V2RAY_API_URL}/panel/api/inbounds/update/${data.id}`, data, cookie)).data
            // else {
            //     const { url, token } = customeData
            //     const cookie = {
            //         withCredentials: true,
            //         headers: {
            //             'Cookie': token
            //         }
            //     }
            //     addResult = (await axios.post(`${url}/panel/api/inbounds/update/${data.id}`, data, cookie)).data
            // }
            return addResult
        } catch (error) {
            throw error
        }

    }
    async updateConfig(data, configID) {
        try {
            const config = await this.getConfig(configID)
            
            if (!config) throw createHttpError.NotFound("کانفیگ یافت نشد")
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    config[key] = data[key];
                }
            }

            return await this.editConfig(config)
        } catch (error) {
            throw error
        }
    }
}

module.exports = {
    configService: new configService()
}