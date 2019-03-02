var rbmq = require('amqplib')
var debug = require('debug')('api:messager')
var ch //channel handle

var connect = function (conf) {
    debug("CONNECT %s", conf.url)
    return rbmq.connect(conf.url)
        .catch(function (e) {
            console.warn("connection problem. Retry in 1s")
            return connect(conf)
        })
}

var channel = function (c) {
    debug("CHANNEL")
    return ch = c.createChannel()
}

var exchange = function (exConf) {
    return function (ch) {
        debug("EXCHANGE %s", exConf.key)
        return ch.assertExchange(exConf.key, exConf.type, exConf.options)
            .then(function () {
                return ch
            })
    }
}

var queue = function (exConf, routingKey, qConf) {
    return function (ch) {
        debug("QUEUE %s, routingKey %s", qConf.name, routingKey)
        return ch.assertQueue(qConf.name, qConf.options)
            .then(function (q) {
                return ch.bindQueue(q.queue, exConf.key, routingKey)
            })
            .then(function (q) {
                return {ch: ch, q: q}
            })
    }
}

var sender = function (exConf, routingKey) {
    return function (ch) {
        debug("SENDER @%s", routingKey)
        return function (msg) {
            try {
                ch.publish(exConf.key, routingKey, new Buffer(JSON.stringify(msg)))
                return 0
            } catch (e) {
                console.error("send error")
                throw e
            }
        }
    }
}

var receiver = function (work) {
    return function (ctx) {
        debug("RECEIVER")
        return ctx.ch.consume(
            ctx.q.queue,
            function (msg) {
                var contentString = msg.content.toString()
                let json
                try {
                    json = JSON.parse(contentString)
                } catch (e) {
                    console.error("not a json message!", contentString)
                    ctx.ch.ack(msg)
                    return
                }
                try {
                    var result = work(json)
                    ctx.ch.ack(msg)
                    if (result && result.then) {
                        result
                            .then(function () {
                                ctx.ch.ack(msg)
                            })
                            .catch(function (e) {
                                console.error("WORK exception", e)
                            })
                    }
                } catch (e) {
                    console.error("WORK exception", e)
                }
            },
            {noAck: false}
        )
    }
}

var log = function (o) {
    debug("started")
    return o
}

var initRabbit = function (rb) {
    return connect(rb).then(channel)
}

var createSender = function (exConf, routingKey) {
    return ch.then(exchange(exConf))
        .then(sender(exConf, routingKey))
        .then(log)
}

var createReceiver = function (exConf, routingKey, qConf, work) {
    return ch
        .then(exchange(exConf))
        .then(queue(exConf, routingKey, qConf))
        .then(receiver(work))
        .then(log)
}

module.exports = {initRabbit, createSender, createReceiver}