const { default: axios } = require('axios');
const express = require('express');
const app = express();
const {Telegraf} = require('telegraf');
const bot = new Telegraf('6237341408:AAHpTMQcHUcDGbysVBxMEvFCD25lvPqWhEc');

bot.hears('/start', ctx => {
  console.log(ctx.update.message.text);

  ctx.reply("this bot created for see details of your v2ray config: upload, download, total... \n \n /details for get details of config");
});
let list = []
bot.hears('/details', async ctx => {
  list = (await axios.post('http://141.11.246.180:1000/xui/inbound/list',{}, {
    withCredentials: true,
    headers: {
      'Cookie': 'session=MTY4MTEzNDU5NHxEdi1CQkFFQ180SUFBUkFCRUFBQVpmLUNBQUVHYzNSeWFXNW5EQXdBQ2t4UFIwbE9YMVZUUlZJWWVDMTFhUzlrWVhSaFltRnpaUzl0YjJSbGJDNVZjMlZ5XzRNREFRRUVWWE5sY2dIX2hBQUJBd0VDU1dRQkJBQUJDRlZ6WlhKdVlXMWxBUXdBQVFoUVlYTnpkMjl5WkFFTUFBQUFKZi1FSWdFQ0FRNXRZWFJwYmkxa1pYcG9ZbUZ1YVFFTlRVRlVTVTVrWlhwb1ltRnVhUUE9fD0t7BMKrYe1C5-70WxTY8SCsBY2p2kjvt90qlcwOyqw'
    }
  })).data.obj
  ctx.reply("enter config name")
  list.map(config =>{
    const download = (config.down / (1024 * 1024 * 1024)).toFixed(2) < 1? (config.down / (1024 * 1024)) : (config.down / (1024 * 1024 * 1024)).toFixed(2)
    const downSymbol = (config.down / (1024 * 1024 * 1024)).toFixed(2) < 1 ? 'MB' : 'GB'
    bot.hears(`${config.remark}`, ctx => {
      ctx.reply(`config name: ${config.remark} \n downloaded: ${download} ${downSymbol} \n uploded: ${Math.floor(config.up / (1024 * 1024 ))} MB \n total: ${config.total / (1024 * 1024 * 1024)} GB`)
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

