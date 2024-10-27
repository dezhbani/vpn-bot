import farvardin from "farvardin";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

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

const padWithZeros = (number) => {
    return number.toString().padStart(2, '0');
  };
  
  const timestampToTime = (timestamp, time = true) => {
    if (!timestamp) return 'زمان وجود ندارد';
  
    const date = new Date(timestamp);
  
    if (date.getFullYear() < new Date().getFullYear()) {
      return "بدون محدودیت زمانی";
    } else {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const fullDate = farvardin.gregorianToSolar(year, month, day, "string");
  
      if (time) {
        const hours = padWithZeros(date.getHours());
        const minutes = padWithZeros(date.getMinutes());
        const seconds = padWithZeros(date.getSeconds());
        return `${fullDate} ${hours}:${minutes}:${seconds}`;
      }
  
      return fullDate;
    }
  };

const useQuery = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    return queryParams
}
const setTitle = title => {
    document.title = title;
}
const copyElement = (tag, length) => {
    const numbers = Array.from({ length: length }, (_, index) => index + 1);
    return numbers.map(() => tag)
}

const handleError = error => {
    toast.error(error.response.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
}
const handleMessage = data => {
    toast.success(data.message, {autoClose: 3000})
}
const clculateData = config =>{
    const mass = (config / (1024 * 1024 * 1024)).toFixed(2) < 1? Math.floor(config / (1024 * 1024)) : (config / (1024 * 1024 * 1024)).toFixed(2)
    const massSymbol = (config / (1024 * 1024 * 1024)).toFixed(2) < 1 ? 'MB' : 'GB'
    return `${mass} ${massSymbol}`
}
export {
    lastIndex,
    redirect,
    headers,
    p2eDigits,
    AD2solarDate,
    addCommaToPrice,
    timestampToTime,
    useQuery,
    setTitle,
    copyElement,
    handleError,
    clculateData,
    handleMessage
}