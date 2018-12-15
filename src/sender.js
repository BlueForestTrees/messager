#!/usr/bin/env node

import amqp from 'amqplib'

let idx = 0
const ex = 'BF-EXCHANGE'

amqp.connect('amqp://localhost')
    .then(conn => {
        conn.createChannel().then(
            ch => {
                ch.assertExchange(ex, 'direct', {durable: false})
                every(10, () => send(ch))
            }
        )
    })

const send = ch => {
    const msg = 'Hello World #' + (idx++)
    ch.publish(ex, Math.random() > 0.5 ? 'left' : 'right', new Buffer(msg))
    console.log(" [x] Sent %s", msg)
}

const every = (delay, command) => {
    const call = () => {
        command()
        setTimeout(call, delay)
    }
    call()
}