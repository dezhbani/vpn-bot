const request = require("request");

class smsService{
    async sendOTP(mobile, code){  
        return request.post({
            url: 'http://ippanel.com/api/select',
            body: {
                "op":"pattern",
                "user":"u-9906345580",
                "pass":"MATINdezhbani",
                "fromNum":"+983000505",
                "toNum": `${mobile}`,
                "patternCode":"6x5e01fhw2",
                "inputData":[
                        {"code":`${code}`}
                        ]
            },
            json: true,
            }, (error, response, body) => {
            if (!error) return true
        });
    }
    sendEndTime(mobile){
        
    }
    async resendConfig(mobile, config){
        return request.post({
            url: 'http://ippanel.com/api/select',
            body: {
                "op":"pattern",
                "user":"u-9906345580",
                "pass":"MATINdezhbani",
                "fromNum":"+983000505",
                "toNum": `${mobile}`,
                "patternCode":"4gzcq6i4u27z4ga",
                "inputData":[
                        {"config": config}
                        ]
            },
            json: true,
            }, (error, response, body) => {
            if (!error) return true
        });
    }
    async repurchaseMessage(mobile, name){
        return request.post({
            url: 'http://ippanel.com/api/select',
            body: {
                "op":"pattern",
                "user":"u-9906345580",
                "pass":"MATINdezhbani",
                "fromNum":"+983000505",
                "toNum": `${mobile}`,
                "patternCode":"6taekc2kqwxpw4r",
                "inputData":[
                        {"name": name}
                        ]
            },
            json: true,
            }, (error, response, body) => {
            if (!error) return true
        });
    }
    async endTimeMessage(mobile, name, day){
        return request.post({
            url: 'http://ippanel.com/api/select',
            body: {
                "op":"pattern",
                "user":"u-9906345580",
                "pass":"MATINdezhbani",
                "fromNum":"+983000505",
                "toNum":`${mobile}`,
                "patternCode":"h007suwebt7dhhh",
                "inputData":[
                        {"name": name, "day": day}
                    ]
            },
            json: true,
            }, function (error, response, body) {
            });
    }
    async endData(mobile, name, percent){
        return request.post({
            url: 'http://ippanel.com/api/select',
            body: {
                "op":"pattern",
                "user":"u-9906345580",
                "pass": "MATINdezhbani",
                "fromNum":"+983000505",
                "toNum": `${mobile}`,
                "patternCode":"dz857kr81uwm6ss",
                "inputData":[
                        {"name": name, "percent": percent}
                        ]
            },
            json: true,
            }, (error, response, body) => {
            if (!error) return true
        });
    }
}

module.exports= {
    smsService: new smsService()
}