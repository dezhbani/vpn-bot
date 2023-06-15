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
}

module.exports= {
    smsService: new smsService()
}