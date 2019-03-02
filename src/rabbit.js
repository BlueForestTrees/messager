import rbmq from 'amqplib'

const debug = require('debug')('api:messager')

let ch

const connect = async ({url}) => {
    debug("CONNECT %s", url)
    try {
        return await rbmq.connect(url)
    } catch (e) {
        console.warn("connection problem. Retry in 1s")
        return connect({url})
    }
}

const channel = c => {
    debug("CHANNEL")
    return ch = c.createChannel()
}

const exchange = exConf => ch => {
    debug("EXCHANGE %s", exConf.key)
    return ch.assertExchange(exConf.key, exConf.type, exConf.options).then(() => ch)
}

const queue = (exConf, routingKey, qConf) => ch => {
    debug("QUEUE %s, routingKey %s", qConf.name, routingKey)
    return ch.assertQueue(qConf.name, qConf.options)
        .then(q => ch.bindQueue(q.queue, exConf.key, routingKey))
        .then(q => ({ch, q}))
}

const sender = (exConf, routingKey) => ch => {
    debug("SENDER @%s")
    return msg => {
        try {
            ch.publish(exConf.key, routingKey, new Buffer(JSON.stringify(msg)))
        } catch (e) {
            console.error("send error")
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
    debug("started")
    return o
}

const initRabbit = rb => connect(rb).then(channel)

const createSender = (exConf, routingKey) =>
    ch
        .then(exchange(exConf))
        .then(sender(exConf, routingKey))
        .then(log)

const createReceiver = (exConf, routingKey, qConf, work) =>
    ch
        .then(exchange(exConf))
        .then(queue(exConf, routingKey, qConf))
        .then(receiver(work))
        .then(log)

export {initRabbit, createSender, createReceiver}