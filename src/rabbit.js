import rbmq from 'amqplib'
import ENV from "./env"

const debug = require('debug')('api:messager')


const connect = async () => {
    debug("CONNECT %s", ENV.RB.url)
    try {
        return await rbmq.connect(ENV.RB.url)
    } catch (e) {
        console.warn("connection problem. Retry in 1s")
        return connect()
    }
}

const channel = c => {
    debug("CHANNEL")
    return c.createChannel()
}

const exchange = ch => {
    debug("EXCHANGE %s", ENV.RB.exchange.key)
    return ch.assertExchange(ENV.RB.exchange.key, ENV.RB.exchange.type, ENV.RB.exchange.options).then(() => ch)
}

const queue = (routingKey, qConf) => ch => {
    debug("QUEUE %s, routingKey %s", qConf.name, routingKey)
    return ch.assertQueue(qConf.name, qConf.options)
        .then(q => ch.bindQueue(q.queue, ENV.RB.exchange.key, routingKey))
        .then(q => ({ch, q}))
}

const sender = routingKey => ch => {
    debug("SENDER @%s")
    return msg => {
        try {
            ch.publish(ENV.RB.exchange.key, routingKey, new Buffer(JSON.stringify(msg)))
        } catch (e) {
            console.error("erreur d'envoi")
            throw e
        }
    }
}

const receiver = work => ({ch, q}) => {
    debug("RECEIVER")
    return ch.consume(
        q.queue,
        async msg => {
            const contentString = msg.content.toString()
            let json
            try {
                json = JSON.parse(contentString)
            } catch (e) {
                console.error("not a json message!", contentString)
                ch.ack(msg)
                return
            }
            try {
                await work(json)
                ch.ack(msg)
            } catch (e) {
                console.error("WORK exception", e)
            }
        },
        {noAck: false}
    )
}

const log = o => {
    debug("démarré")
    return o
}

const rabbit = () =>
    connect()
        .then(channel)
        .then(exchange)

const createSender = routingKey =>
    rabbit()
        .then(sender(routingKey))
        .then(log)

const createReceiver = (routingKey, qConf, work) =>
    rabbit()
        .then(queue(routingKey, qConf))
        .then(receiver(work))
        .then(log)

export {createSender, createReceiver}