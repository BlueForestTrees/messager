#!/usr/bin/env node
import ENV from "./env"
import closer from "node-closer"
import {createReceiver, initRabbit} from "../src/index"

closer(()=>{
    console.log("graceful shutdown")
    process.exit()
})

const receiveMsg = msg => {
    console.log("%s RECEIVED: %s", new Date(), JSON.stringify(msg))
}

initRabbit({url: ENV.RB.url})
    .then(() => createReceiver(ENV.RB.exchange, ENV.ROUTING_KEY, ENV.QUEUE, receiveMsg))
