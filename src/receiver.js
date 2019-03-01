#!/usr/bin/env node
import ENV from "./env"
import closer from "./closer"
import {createReceiver} from "./rabbit"

closer(process.exit)

createReceiver(ENV.ROUTING_KEY, ENV.QUEUE, msg => {
    console.log("%s RECEIVED: %s", new Date(), JSON.stringify(msg))
})