#!/usr/bin/env node

import amqp from 'amqplib'

const receive = msg => {
    if (msg.content) {
        console.log(" [x] %s", msg.content.toString())
    } else if (msg.consumerTag) {
        console.error("consumer tag:", msg)
    } else {
        console.error("mess without content", msg)
    }
}

const args = process.argv.slice(2);

if (args.length === 0) {
    process.exit(1);
}

const EXCHANGE_KEY = 'BF-EXCHANGE'
const connect = () => amqp.connect('amqp://localhost')
const channel = conn => conn.createChannel()

const exchange = ch => ch.assertExchange(EXCHANGE_KEY, 'direct', {durable: false})
    .then(() => ch)

const queue = ch => ch.assertQueue('', {exclusive: true})
    .then(q => {
        console.log(" [*] Waiting for messages in %s, select %s. To exit press CTRL+C", q.queue, args[0])
        return ch.bindQueue(q.queue, EXCHANGE_KEY, args[0])
    }).then(q => ({ch, q}))

const consume = ({ch, q}) => ch.consume(q.queue, receive)


connect()
    .then(channel)
    .then(exchange)
    .then(queue)
    .then(consume)
    .then(receive)