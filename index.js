const { default: axios } = require('axios');
const express = require('express');
const app = express();
const {Telegraf} = require('telegraf');
const bot = new Telegraf('6237341408:AAHpTMQcHUcDGbysVBxMEvFCD25lvPqWhEc');

bot.hears('/start', ctx => {
  const message = ctx.update.message
  ctx.reply(`سلام ${message.chat.first_name} خوش اومدی!🤗\n میتونی از این دستورا استفاده کنی👇\n /details برای اطلاع از جزییات کانفیگ\nو اطلاعات کانفیگت برات ارسال میشه 😉`);
});
let list = []
bot.hears('/details', async ctx => {
  list = (await axios.post('http://141.11.246.180:1000/xui/inbound/list',{}, {
    withCredentials: true,
    headers: {
      'Cookie': 'session=MTY4MTEzNDU5NHxEdi1CQkFFQ180SUFBUkFCRUFBQVpmLUNBQUVHYzNSeWFXNW5EQXdBQ2t4UFIwbE9YMVZUUlZJWWVDMTFhUzlrWVhSaFltRnpaUzl0YjJSbGJDNVZjMlZ5XzRNREFRRUVWWE5sY2dIX2hBQUJBd0VDU1dRQkJBQUJDRlZ6WlhKdVlXMWxBUXdBQVFoUVlYTnpkMjl5WkFFTUFBQUFKZi1FSWdFQ0FRNXRZWFJwYmkxa1pYcG9ZbUZ1YVFFTlRVRlVTVTVrWlhwb1ltRnVhUUE9fD0t7BMKrYe1C5-70WxTY8SCsBY2p2kjvt90qlcwOyqw'
    }
  })).data.obj
console.log(list[1]);
  ctx.reply("اسم کانفیگت رو بفرست")
  console.log(ctx.update.message)
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
      return date.toDateString()
    }
  }
  list.map(config =>{
    bot.hears(`${config.remark}`, ctx => {
      ctx.reply(`نام کانفیگ: ${config.remark} \n دانلود شده:  ${clculate(config.down).mass} ${clculate(config.down).massSymbol} \n آپلود شده:  ${clculate(config.up).mass} ${clculate(config.up).massSymbol} \n کل حجم:  ${config.total == 0? 'نا محدود' : config.total / (1024 * 1024 * 1024)} GB \n کل حجم مصرف شده:  ${totalConsumed(config.up, config.down).mass} ${totalConsumed(config.up, config.down).massSymbol} \n تاریخ انقضا: ${timestampToDate(config.expiryTime)}`)
    })
  })
});

app.post('/bot', express.json(), (req, res) => {
  bot.handleUpdate(req.body, res);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

bot.launch();

