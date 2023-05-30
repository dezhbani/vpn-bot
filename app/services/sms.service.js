const { default: axios } = require("axios");

class smsService{
    sendOTP(mobile, code){  
        const SMS = axios.post('http://ippanel.com/api/select', {
            "op":"pattern",
            "user":"u-9906345580",
            "pass":"MATINdezhbani",
            "fromNum":"+9850001040241565",
            "toNum": `${mobile}`,
            "patternCode":"6x5e01fhw2",
            "inputData":[
                {"code":`${code}`},
                ]
        });
        console.log(SMS);
    }
    sendEndTime(mobile){

    }
}

module.exports= {
    smsService
}