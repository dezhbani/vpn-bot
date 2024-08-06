const Application = require("./app/server");
new Application(80, "mongodb://127.0.0.1:27017/vpn-store")
// new Application(8000, "mongodb://127.0.0.1:27017/vpn-store")