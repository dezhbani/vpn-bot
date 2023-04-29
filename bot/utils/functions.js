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
const timestampToDate = (timestamp) =>{
    const date = new Date(timestamp);
    if(date.getFullYear() < new Date().getFullYear()){
      return "بدون محدودیت زمانی"
    }else{
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate() 
        console.log(year, month, day);
      return farvardin.gregorianToSolar(year , month , day , "string")
    }
}

module.exports = {
    clculate,
    totalConsumed,
    timestampToDate
}