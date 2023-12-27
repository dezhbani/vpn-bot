import { useContext } from "react";
import { ProfileContext } from "../context/UserProfileContext";
import Loading from "../admin/public/Loading";

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
    let count = 0;
    let i = 0
    arrPrice.map(p => {
        if(i%3 == 0 && i !== 0){
            arrPrice[i] += ','
            console.log(arrPrice[i]);
            console.log(i, i%3);
        }
        i++
    })
    arrPrice.reverse()
    const result = arrPrice.join('');
    return result;
}

const timestampToTime = (timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const time = `${hour}:${minute}:${second}`;
    return time
}

export {
    lastIndex,
    redirect,
    headers,
    p2eDigits,
    AD2solarDate,
    addCommaToPrice,
    timestampToTime
}