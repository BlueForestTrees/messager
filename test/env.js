var version = require('./../package.json').version
var fs = require('fs')

var ENV = {
    ROUTING_KEY: "trunk-upsert",
    RB_PATH: process.env.RB_PATH || "mq.json",
    QUEUE_PATH: process.env.QUEUE_PATH || "queue.json",

    NODE_ENV: process.env.NODE_ENV || null,
    VERSION: version,

    DB_NAME: process.env.DB_NAME || "BlueForestTreesDB",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 27017,
    DB_USER: process.env.DB_USER || "doudou",
    DB_PWD: process.env.DB_PWD || "masta",
}

ENV.VERSION = "1.0.0";

debug({ENV});

if (debug.enabled) {
    debug({ENV: ENV})
} else {
    console.log(JSON.stringify(ENV))
}

module.exports = ENV