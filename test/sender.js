#!/usr/bin/env node
import ENV from "./env"
import closer from "node-closer"
import {createSender, initRabbit} from "../src/index"
import every from "./every"

closer(()=>{
    console.log("graceful shutdown")
    process.exit()
})

const sendMsgs = send => {
    let idx = 0
    every(100, () => {
        try {
            const msg = {_id: idx, message: `Hello World #${idx++}`}
            send(msg)
            console.log(msg)
        } catch (e) {
            console.error("erreur d'envoi", e.message)
        }
    }).then(stopper => {
        closer(stopper)
    }).catch(console.error)
}

initRabbit({url: ENV.RB.url})
    .then(() => createSender(ENV.RB.exchange, ENV.ROUTING_KEY))
    .then(sendMsgs)