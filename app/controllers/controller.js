const autoBind = require("auto-bind");

class Controllers{
    constructor(){
        autoBind(this)
    }
    testMethod(){
        console.log("test string");
        return "test string"
    }
}

module.exports ={
    Controllers
}