import {version} from './../package.json'
import fs from 'fs'

const ENV = {
    ROUTING_KEY: "post-trunk",
    RB_PATH: process.env.RB_PATH || "mq.json",
    QUEUE_PATH: process.env.QUEUE_PATH || "queue.json",

    NODE_ENV: process.env.NODE_ENV || null,
    VERSION: version,
}

ENV.RB = JSON.parse(fs.readFileSync(ENV.RB_PATH, 'utf8'))
ENV.QUEUE = JSON.parse(fs.readFileSync(ENV.QUEUE_PATH, 'utf8'))

const debug = require('debug')(`api:messager`)

if (debug.enabled) {
    debug({ENV})
} else {
    console.log(JSON.stringify(ENV))
}

export default ENV