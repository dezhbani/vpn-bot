const farvardin = require("farvardin")

const clculate = config =>{
    const mass = (config / (1024 * 1024 * 1024)).toFixed(2) < 1? Math.floor(config / (1024 * 1024)) : (config / (1024 * 1024 * 1024)).toFixed(2)
    const massSymbol = (config / (1024 * 1024 * 1024)).toFixed(2) < 1 ? 'MB' : 'GB'
    return {mass, massSymbol}
}
const totalConsumed = (up, down) => {
    const total = up + down
    return clculate(total)
}
const timestampToDate = (timestamp, time=false) =>{
    const date = new Date(timestamp);
    if(!timestamp) return 'زمان وجود ندارد'
    if(date.getFullYear() < new Date().getFullYear()){
      return "بدون محدودیت زمانی"
    }else{
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate() ;
        const fullDate = farvardin.gregorianToSolar(year , month , day , "string");
        if(time){
            const hours = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            return `${fullDate} ${hours}:${minute}:${second}`
        }
      return fullDate
    }
}
const validationMobile = mobile => {
    const mobileRegex = /^09[0-9]{9}$/
    const isMobile = mobileRegex.test(mobile)
    return !!isMobile
}

module.exports = {
    clculate,
    totalConsumed,
    timestampToDate,
    validationMobile
}