import farvardin from "farvardin";
import { useLocation } from "react-router-dom";

const lastIndex = (array = []) => {
    const last = array.length - 1;
    return array[last]
}
const token = localStorage.getItem('accessToken')
const authorization = `bearer ${token}`
const headers = {
    headers: {
        authorization
    }
}
const redirect = (route = '') => {
    window.location.href = route
}

const p2eDigits = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)) //convert persian digits to english

const AD2solarDate = (date) => {
    let mydate = new Date(date);
    let mypersiandate = mydate.toLocaleDateString('fa-IR');
    return mypersiandate
}

const addCommaToPrice = (price) => {
    let strPrice = price? '' + price: '0'
    const arrPrice = strPrice.split('')
    arrPrice.reverse()
    let i = 0
    arrPrice.map(p => {
        if(i%3 == 0 && i !== 0){
            arrPrice[i] += ','
        }
        i++
    })
    arrPrice.reverse()
    const result = arrPrice.join('');
    return result;
}

const timestampToTime = (timestamp, time=true) =>{
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

const useQuery = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    return queryParams
}
export {
    lastIndex,
    redirect,
    headers,
    p2eDigits,
    AD2solarDate,
    addCommaToPrice,
    timestampToTime,
    useQuery
}