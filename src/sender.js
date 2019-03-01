#!/usr/bin/env node
import ENV from "./env"
import closer from "./closer"
import {createSender} from "./rabbit"
import every from "./every"

let idx = 0
const pickMessage = () => ({
    _id: idx,
    message: `Hello World #${idx++}`
})

closer(process.exit)

createSender(ENV.ROUTING_KEY)
    .then(send => {
        every(100, () => {
            const msg = pickMessage()
            try {
                send(msg)
                console.log(msg)
            } catch (e) {
                console.error("erreur d'envoi", e.message)
            }
        }).then(stopper => {
            closer(stopper)
        }).catch(console.error)
    })

