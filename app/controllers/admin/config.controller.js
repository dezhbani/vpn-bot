const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema, addConfigSchema } = require("../../validations/admin/config.shema");
const { Controllers } = require("../controller");
const { percentOfNumber, configExpiryTime, copyObject, covertGBtoBite, GbToBit } = require("../../utils/functions");
const { default: axios } = require('axios');
const { userModel } = require("../../models/user");
const { createVlessTcp } = require("../../utils/config.type");
const { smsService } = require("../../services/sms.service");
const { configModel } = require("../../models/config");
const { checkPaymentType } = require("../../utils/paymet.functions");
const { configService } = require("../../services/config.service");

class configController extends Controllers {
  async buyConfig(req, res, next) {
    try {
      const { planID, full_name, first_name, last_name, mobile } = await addConfigSchema.validateAsync(req.body);
      const owner = req.user
      const user = await this.createUser(full_name, first_name, last_name, mobile, owner._id)
      const plan = await planModel.findById(planID);
      if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد")
      const percentOfPlan = percentOfNumber(plan.price, 70);
      const paymentType = await checkPaymentType('ارتقا کانفیگ کاربر', percentOfPlan, owner._id, user._id)
      if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
      return this.addConfig(req, res, next);
    } catch (error) {
      next(error)
    }
  }
  async addConfig(req, res, next) {
    try {
      const owner = req.user
      const { full_name, first_name, last_name, mobile, planID } = await addConfigSchema.validateAsync(req.body);
      const plan = await this.findPlanByID(planID);
      const percentOfPlan = percentOfNumber(plan.price, 70);
      if (owner.wallet < percentOfPlan) throw createHttpError.BadRequest("موجودی حساب شما کافی نمی باشد")
      const lastConfigID = await this.getConfigID();
      await this.createUser(full_name, first_name, last_name, mobile, owner._id)
      const user = await userModel.findOne({ mobile })
      const fullName = `${user.first_name} ${user.last_name}`;
      const { details, configContent: config_content, id } = await createVlessTcp(lastConfigID, plan, fullName)
      const addConfig = await configService.addConfig(details)
      const configs = {
        name: fullName,
        config_content,
        expiry_date: +configExpiryTime(plan.month),
        configID: id,
        userID: user._id,
        planID: plan._id
      }
      const bills = {
        planID,
        configID: id,
        buy_date: new Date().getTime(),
        for: {
          description: 'خرید کانفیگ'
        },
        up: true,
        price: plan.price
      }
      // update owner
      if (!addConfig?.success) throw createHttpError.InternalServerError("کانفیگ ایجاد نشد")
      // update user 
      const paymentType = await checkPaymentType('ثبت کانفیگ کاربر', percentOfPlan, owner._id, user._id, bills.configID)
      if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
      const createResult = await configModel.create(configs)
      if (!createResult) throw createHttpError.InternalServerError('کانفیگ ثبت نشد')
      const saveResult = await userModel.updateOne({ mobile }, { $push: { bills } })
      if (saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: "کانفیگ ایجاد شد",
        configContent: config_content
      })
    } catch (error) {
      next(error)
    }
  }
  async getAll(req, res, next) {
    try {
      const { _id: userID } = req.user;
      await this.updateConfigDetails()
      const adminsCustomer = await userModel.find({ by: userID }, { _id: 1 })
      const adminAllConfigs = await configModel.find({ userID: { $in: adminsCustomer } })
      const list = adminAllConfigs
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        configs: list.length ? list : null
      })
    } catch (error) {
      next(error)
    }
  }
  async upgradeConfig(req, res, next) {
    try {
      const { _id: ownerID } = req.user;
      const { configID, planID } = req.body;
      const config = await configModel.findOne({ configID })
      if (!config) throw createHttpError.NotFound("کانفیگ یافت نشد")
      const plan = await planModel.findById(planID)
      if (!plan) throw createHttpError.NotFound("پلن موردنظر یافت نشد")
      if (config.planID == planID) throw createHttpError.BadRequest("پلن انتخابی برای ارتقا، با پلن فعلی یکی میباشد")
      const user = await userModel.findOne({ _id: config.userID, by: ownerID })
      if (!user) throw createHttpError.NotFound("کاربر یافت نشد")
      const oldPlan = await planModel.findOne({ _id: config.planID })
      if (!oldPlan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")
      const price = percentOfNumber(plan.price - oldPlan.price, 70)
      const paymentType = await checkPaymentType('ارتقا کانفیگ کاربر', price, ownerID, config.userID)
      if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
      const data = {
        total: GbToBit(plan.data_size)
      }
      // update config details (upgrade config)
      const result = await configService.updateConfig(data, configID)
      if (!result.success) throw createHttpError.InternalServerError("مشکلی در ارتقا کانفیگ رخ داد")

      // owner or admin
      const ownerBills = {
        planID: plan._id,
        configID,
        buy_date: new Date().getTime(),
        for: {
          description: 'ارتقا کانفیگ کاربر',
          user: user._id,
        },
        up: true,
        price
      }
      const owner = await userModel.findById(ownerID)
      const wallet = owner.wallet - price
      const updateOwnerWallet = await userModel.updateOne({ _id: ownerID }, { $push: { ownerBills }, $set: { wallet } })
      //user 
      const bills = {
        planID: plan._id,
        configID,
        buy_date: new Date().getTime(),
        for: {
          description: 'ارتقا کانفیگ'
        },
        up: true,
        price: plan.price - oldPlan.price
      }
      const updateUserBills = await userModel.updateOne({ _id: user._id }, { $push: { bills } })
      const updateConfigResult = await configModel.updateOne({ configID }, { $set: { endData: false, planID } })
      if (updateUserBills.modifiedCount == 0 || 
        updateOwnerWallet.modifiedCount == 0 || 
        updateConfigResult.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی در ارتقا کانفیگ به وجود امد")

      return res.status(StatusCodes.OK).json({
        message: "کانفیگ کاربر ارتقا یافت"
      })

    } catch (error) {
      next(error)
    }
  }
  async getBYEndedTime(req, res, next) {
    try {
      const { _id: ownerID } = req.user;
      const { day } = req.body;
      const alertDay = +day
      let list = [];
      const configs = await configModel.find();
      await Promise.all(
        configs.map(async config => {
          // user config time
          const time = new Date(+config.expiry_date);
          const month = time.getMonth()
          const year = time.getFullYear()
          // now time
          const today = new Date();
          const nowMonth = new Date().getMonth()
          const nowYear = new Date().getFullYear()
          let daysUntilTime = Math.abs(time.getTime() - today.getTime());
          daysUntilTime = Math.ceil(daysUntilTime / (1000 * 60 * 60 * 24))
          if (daysUntilTime - 1 == alertDay && month == nowMonth && year == nowYear && config.status) {
            const user = await userModel.findOne({ by: ownerID, _id: config.userID });
            if (!user) throw createHttpError.Forbidden("این کاربر توسط شما ثبت نشده،شما نمیتوانید اطلاعات آن را ببینید")
            const { mobile, first_name, last_name, full_name, chatID, _id: userID } = user;
            const { expiry_date, configID, name, status } = config;
            const data = copyObject(config)
            data.port = ((config.config_content.split(':')[2]).split('?')[0])
            list.push({ mobile, name, userID, port: data.port, status, expiry_date, configID, untilEndTime: daysUntilTime - 1 })
          }
        })
      )
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        configs: list.length ? list : null
      })
    } catch (error) {
      next(error)
    }
  }
  async getUserActiveConfigs(req, res, next) {
    try {
      const { _id: ownerID } = req.user;
      const { userID } = req.params;
      const configs = await configModel.find({ userID }, { endData: 0, createdAt: 0, updatedAt: 0 })
      let list = await userModel.populate(configs, {
        path: 'userID',
        select: "by -_id"
      })
      list = await planModel.populate(list, {
        path: 'planID'
      })
      list = list.map(config => {
        const data = copyObject(config)
        data.port = ((config.config_content.split(':')[2]).split('?')[0])
        return data
      })
      list = list.filter(config => config.userID.by == `${ownerID}`)
      if (list.length == 0) throw createHttpError.NotFound("برای کاربر مورد نطر هیچ کانفیگی ثبت نشده")
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        list
      })
    } catch (error) {
      next(error)
    }
  }
  async deleteConfig(req, res, next) {
    try {
      const { configID } = await deleteConfigSchema.validateAsync(req.body)
      const findV2rayConfig = await this.findConfigByID(configID)
      const config = await configModel.findOne({ configID })
      if (!config || !findV2rayConfig) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد")
      findV2rayConfig.enable = false;
      const configResult = await this.updateConfig(findV2rayConfig.id, findV2rayConfig)
      const result = await configModel.updateOne({ configID }, { $set: { status: false } });
      if (result.modifiedCount == 0 || configResult.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ حذف نشد")
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "کانفیگ حذف شد"
      })
    } catch (error) {
      next(error)
    }
  }
  async changeStatus(req, res, next) {
    try {
      const { configID, userID } = req.body
      const user = await userModel.findById(userID)
      if (!user) throw createHttpError.NotFound("کاربر یافت نشد")
      let configsData = await this.findConfigByID(configID)
      if (!configsData) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد")
      configsData.enable = !configsData.enable;
      const result = await configService.updateConfig(configsData, configsData.id)
      if (result) throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
      // update config
      const updateResult = await configModel.updateOne({ configID }, { $set: { status: configsData.enable } })
      if (updateResult.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: configsData.enable ? 'کانفیگ فعال شد' : 'کانفیگ غیر فعال شد',
        configStatus: configsData.enable
      })
    } catch (error) {
      next(error)
    }
  }
  async repurchase(req, res, next) {
    try {
      const owner = req.user
      const { userID, configID } = await req.body;
      const user = await userModel.findById(userID)
      if (!user) throw createHttpError.NotFound("کاربر یافت نشد")
      const config = await configModel.findOne({ userID, configID })
      if (!config) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
      const plan = await planModel.findOne({ _id: config.planID })
      if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")
      const configsData = await this.findConfigByID(configID)
      if (!configsData) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
      const data = {
        expiryTime: +configExpiryTime(plan.month),
        up: 0,
        down: 0,
        enable: true,
        total: covertGBtoBite(plan.data_size)
      }
      const percentOfPlan = percentOfNumber(plan.price, 70)
      if (owner.wallet < percentOfPlan) throw createHttpError.BadRequest("موجودی حساب شما کافی نمی باشد")
      const result = await configService.updateConfig(data, configID)
      const bills = {
        planID: plan._id,
        configID,
        buy_date: new Date().getTime(),
        for: {
          description: 'تمدید کانفیگ'
        },
        up: true,
        price: plan.price
      }
      const ownerBills = {
        planID: plan._id,
        configID,
        buy_date: new Date().getTime(),
        for: {
          description: 'تمدید کانفیگ کاربر',
          user: user._id
        },
        up: true,
        price: percentOfPlan
      }
      const wallet = owner.wallet - percentOfPlan;
      const updateWallet = await userModel.updateOne({ mobile: owner.mobile }, { $set: { wallet }, $push: { bills: ownerBills } })
      const updateConfig = await configModel.updateOne({ configID }, { $set: { expiry_date: +configExpiryTime(plan.month), endData: false } })
      // update user 
      if (!result || updateWallet.modifiedCount == 0 || updateConfig.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ تمدید نشد")
      const saveResult = await userModel.updateOne({ _id: userID }, { $push: { bills } })
      if (saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
      await smsService.repurchaseMessage(user.mobile, user.full_name)
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "کانفیگ تمدید شد"
      })
    } catch (error) {
      next(error)
    }
  }
  async deleteListOfConfigs() {
    const arr = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
    // arr.map( async value => {
    //     const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/del/${value}`, {}, {
    //         withCredentials: true,
    //         headers: {
    //             'Cookie': V2RAY_TOKEN
    //         }
    //     })).data
    // })
  }
  async getAllConfigs() {
    const configs = await configService.getConfigs()
    // const jsonData = JSON.stringify(configs, null, 2);
    // fs.writeFile('./data.json', jsonData, (err) => {
    //   if (err) {
    //     console.error('Error writing file', err);
    //   } else {
    //     console.log('File has been written successfully');
    //   }
    // });
    return configs
  }
  async backupAndRestoreConfigs() {
    try {
      const configs = await this.getAllConfigs()
      const panelData = {
        username: "matin-dezhbani",
        password: "MATINdezhbani",
        url: "http://s1.delta-dev.top:1000",
      }
      const token = await configService.loginPanel(panelData)
      console.log(token);

      // configs.map(async config => {
      //   const result = await configService.editConfig(config, false, {url: panelData.url, token})
      //   console.log(result);
      // })
      // console.log(configs);

    } catch (error) {
      console.log(error);
    }
  }
  async getConfigID() {
    const configs = await configService.getConfigs()
    const lastIndex = configs.length - 1
    const lastConfigID = configs[lastIndex].id + 1
    return lastConfigID
  }
  async createUser(full_name, first_name, last_name, mobile, by) {
    const user = await userModel.findOne({ mobile })
    if (user) {
      if (!(JSON.stringify(user.by) == JSON.stringify(by))) throw createHttpError.Forbidden("این کاربر توسط ادمین دیگری ثبت شده")
      return user
    } else {
      const newUser = await userModel.create({ full_name, first_name, last_name, mobile, by })
      if (!newUser) return createHttpError.InternalServerError('یوزر ثبت نشد')
      return newUser
    }
  }
  async findConfigByID(configID) {
    const config = await configService.getConfig(configID)
    if (!config) throw createHttpError.NotFound("کانفیگی یافت نشد");
    return config
  }
  async findPlanByID(planID) {
    const plan = await planModel.findById(planID);
    if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
    return plan
  }
  async replaceAllConfigs() {
    // try {
    //     // fs.readFile('./data.json', 'utf8', (err, data) => {
    //     //     if (err) {
    //     //       console.error('Error reading file', err);
    //     //       return;
    //     //     }
    //     //     // console.log(data);
    //     // })
    let data = [
      {
        "id": 11,
        "up": 300179644,
        "down": 12438407815,
        "total": 64424509440,
        "remark": "navid dezhbani",
        "enable": true,
        "expiryTime": 1734640188406,
        "clientStats": [
          {
            "id": 10,
            "inboundId": 11,
            "enable": true,
            "email": "bcp7vaqv",
            "up": 31692064,
            "down": 1651396891,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 19738,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"5a292f56-d590-4cfa-969b-f2f8d637ad0f\",\n      \"flow\": \"\",\n      \"email\": \"bcp7vaqv\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"s01v918e20ncgrh5\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-19738",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 8,
        "up": 447048488,
        "down": 15236218088,
        "total": 42949672960,
        "remark": "reza dezhbani",
        "enable": true,
        "expiryTime": 1733862557398,
        "clientStats": [
          {
            "id": 7,
            "inboundId": 8,
            "enable": true,
            "email": "ciazvu7a",
            "up": 11898270,
            "down": 472268058,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 41522,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"dff23187-c6b1-4626-8805-19214e5e7c20\",\n      \"flow\": \"\",\n      \"email\": \"ciazvu7a\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"7b6rad7iutxco37x\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-41522",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 10,
        "up": 1141418897,
        "down": 24463515721,
        "total": 64424509440,
        "remark": "nasim jabali",
        "enable": true,
        "expiryTime": 1733516941021,
        "clientStats": [
          {
            "id": 9,
            "inboundId": 10,
            "enable": true,
            "email": "655pp6c0",
            "up": 38654898,
            "down": 630152685,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 14451,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"acc3e48c-37f4-424e-aab0-ddf8e4b62303\",\n      \"flow\": \"\",\n      \"email\": \"655pp6c0\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"k546q0f4xgm9tg29\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-14451",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 15,
        "up": 535112942,
        "down": 8507199986,
        "total": 42949672960,
        "remark": "sana mojtehedi",
        "enable": true,
        "expiryTime": 1732652974555,
        "clientStats": [
          {
            "id": 14,
            "inboundId": 15,
            "enable": true,
            "email": "yz0r9fv3",
            "up": 5928,
            "down": 52213,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 43888,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"fb752d23-253f-43c1-b28e-42e4e307290b\",\n      \"flow\": \"\",\n      \"email\": \"yz0r9fv3\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"5kj388tq4vdqfncm\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-43888",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 13,
        "up": 19592572,
        "down": 441178119,
        "total": 21474836480,
        "remark": "tohid bageri",
        "enable": true,
        "expiryTime": 1734640189355,
        "clientStats": [
          {
            "id": 12,
            "inboundId": 13,
            "enable": true,
            "email": "v2qx4fwl",
            "up": 6916,
            "down": 60913,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 11656,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"ebb6708e-12ff-47da-bd50-2b3894207963\",\n      \"flow\": \"\",\n      \"email\": \"v2qx4fwl\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"mv0rpl4bkplatq1p\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-11656",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 7,
        "up": 242117265,
        "down": 9369416170,
        "total": 64424509440,
        "remark": "reza mashhadifam",
        "enable": true,
        "expiryTime": 1732566566081,
        "clientStats": [
          {
            "id": 6,
            "inboundId": 7,
            "enable": true,
            "email": "kh1yhprs",
            "up": 11373384,
            "down": 514068045,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 49666,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"cccc4a38-9900-4bf0-80db-4f78687a9fff\",\n      \"flow\": \"\",\n      \"email\": \"kh1yhprs\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"cixi979s4qqckw78\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-49666",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 12,
        "up": 66641879,
        "down": 1459173483,
        "total": 42949672960,
        "remark": "amir hosein babayi",
        "enable": true,
        "expiryTime": 1733862565125,
        "clientStats": [
          {
            "id": 11,
            "inboundId": 12,
            "enable": true,
            "email": "r7wbz9hi",
            "up": 6971,
            "down": 61088,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 19472,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"52a931cb-84f4-4800-99c3-8ca8b7eae49b\",\n      \"flow\": \"\",\n      \"email\": \"r7wbz9hi\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"qb11a67jjffdwj75\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-19472",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 14,
        "up": 590384217,
        "down": 5112832514,
        "total": 64424509440,
        "remark": "sara salehi",
        "enable": true,
        "expiryTime": 1734726592033,
        "clientStats": [
          {
            "id": 13,
            "inboundId": 14,
            "enable": true,
            "email": "0hwe5ljw",
            "up": 11859,
            "down": 85163,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 24979,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"edd3af1d-3307-4bb5-9ecd-03785a2d996d\",\n      \"flow\": \"\",\n      \"email\": \"0hwe5ljw\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"lalaia9yxj48zm3y\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-24979",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 6,
        "up": 351361697,
        "down": 20365308216,
        "total": 107374182400,
        "remark": "sadra ganbarnezhad",
        "enable": true,
        "expiryTime": 1734208140000,
        "clientStats": [
          {
            "id": 5,
            "inboundId": 6,
            "enable": true,
            "email": "0sft99pw",
            "up": 16610534,
            "down": 500422237,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 25483,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"1e95e7f8-ce8b-4c17-aca6-28f7985dc2a7\",\n      \"flow\": \"\",\n      \"email\": \"0sft99pw\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"bx6p7hfa71vwzqiv\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-25483",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 9,
        "up": 89307708,
        "down": 6776540368,
        "total": 42949672960,
        "remark": "vahid dezhbani",
        "enable": true,
        "expiryTime": 1734121740000,
        "clientStats": [
          {
            "id": 8,
            "inboundId": 9,
            "enable": true,
            "email": "epnvqxwu",
            "up": 4543483,
            "down": 303958284,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 17078,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"512b5384-dae7-4c53-a87c-ff62aa84adb0\",\n      \"flow\": \"\",\n      \"email\": \"epnvqxwu\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"hratciln7i9bjjur\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-17078",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      },
      {
        "id": 16,
        "up": 671338435,
        "down": 8031681874,
        "total": 10737418240,
        "remark": "parham eslahi",
        "enable": true,
        "expiryTime": 1733603340000,
        "clientStats": [
          {
            "id": 15,
            "inboundId": 16,
            "enable": true,
            "email": "bydxyie3",
            "up": 73178781,
            "down": 369728366,
            "expiryTime": 0,
            "total": 0,
            "reset": 0
          }
        ],
        "listen": "",
        "port": 51445,
        "protocol": "vless",
        "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"23c79065-c2bf-4aa5-9284-7cc173cfd8ad\",\n      \"flow\": \"\",\n      \"email\": \"bydxyie3\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": 0,\n      \"enable\": true,\n      \"tgId\": \"\",\n      \"subId\": \"8lw05z3cftljmk1v\",\n      \"reset\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"externalProxy\": [],\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"version\": \"1.1\",\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        "tag": "inbound-51445",
        "sniffing": "{\n  \"enabled\": false,\n  \"destOverride\": [\n    \"http\",\n    \"tls\",\n    \"quic\",\n    \"fakedns\"\n  ],\n  \"metadataOnly\": false,\n  \"routeOnly\": false\n}",
        "allocate": "{\n  \"strategy\": \"always\",\n  \"refresh\": 5,\n  \"concurrency\": 3\n}"
      }
    ]
    data.map(async config => {
      // console.log(config);
      // console.log(details);
      // id = 29
      // config.id = 29
      const addConfig = await axios.post(`http://s1.delta-dev.top:1000/panel/api/inbounds/update/${config.id}`, config, {
        withCredentials: true,
        headers: {
          'Cookie': "3x-ui=MTczMjUzNTQzOHxEWDhFQVFMX2dBQUJFQUVRQUFCMV80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRUVBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFRdE1iMmRwYmxObFkzSmxkQUVNQUFBQUpmLUNJZ0VDQVE1dFlYUnBiaTFrWlhwb1ltRnVhUUVOVFVGVVNVNWtaWHBvWW1GdWFRQT18kvV1PnTOHIHEWt_exuKudygleXFHQoongkOfK_ZEGNw="
        }
      })
      console.log(addConfig.data.success, config.id);
    })
    // } catch (error) {
    //     console.log(error)
    // }
  }
  async updateConfigDetails() {
    const configs = await this.getAllConfigs()
    configs.map(async config => {
      const configID = JSON.parse(config.settings).clients[0].id
      await configModel.updateOne({ configID }, { $set: { status: config.enable, expiry_date: config.expiryTime } })
    })
  }
}

module.exports = {
  configController: new configController(),

}
