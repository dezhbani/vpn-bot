const Application = require("./app/server");
new Application(8000, "mongodb://admin:yourpassword@87.248.150.99:27000/vpn-store?directConnection=true")
// new Application(8000, "mongodb://127.0.0.1:27017/vpn-store")