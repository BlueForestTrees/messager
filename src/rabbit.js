var rbmq = require('amqplib')
var debug = require('debug')('api:messager')

var _channel

var BSON = require("bson")
var bson = new BSON()

var i = Math.round(Math.random() * 100)

var wait = function (timeInMs) {
    return new Promise(function (resolve) {
        setTimeout(resolve, timeInMs)
    })
}

var connect = function (conf) {
    const tryConnect = function () {
        const url = conf.urls && Array.isArray(conf.urls) && conf.urls.length && conf.urls[i % conf.urls.length] || conf.url
        debug("connecting to %s", url)
        return rbmq.connect(url)
            .catch(function (e) {
                i++
                console.warn(e.message)
                return wait(conf.reconnectDelay || 1000).then(tryConnect)
            })
    }
    return tryConnect()
}

var channel = function (c) {
    debug("connection ok. creating channel")
    return _channel = c.createChannel()
}

var exchange = function (exConf) {
    return function (ch) {
        debug("asserting exchange %s", exConf.key)
        return ch.assertExchange(exConf.key, exConf.type, exConf.options)
            .then(function () {
                return ch
            })
    }
}

var queue = function (exConf, routingKey, qConf) {
    return function (ch) {
        debug("asserting queue %s from routingKey %s", qConf.name, routingKey)
        return ch.assertQueue(qConf.name, qConf.options)
            .then(function (q) {
                ch.bindQueue(q.queue, exConf.key, routingKey)
            })
            .then(function () {
                return ch
            })
    }
}

var sender = function (exConf, routingKey) {
    return function (ch) {
        debug("preparing a sender publishing on routingKey %s", routingKey)
        return function (msg) {
            ch.publish(exConf.key, routingKey, bson.serialize(msg))
            return 1
        }
    }
}

var receiver = function (work, routingKey, qConf) {
    return function (ch) {
        debug("preparing a receiver on queue %s from routingKey %s", qConf.name, routingKey)
        return ch.consume(
            qConf.name,
            function (msg) {
                let json
                try {
                    json = bson.deserialize(msg.content)
                } catch (e) {
                    console.error(e.message, Buffer.from(msg.content).toString())
                    ch.ack(msg)
                    return
                }
                try {
                    var result = work(json)
                    if (result && result.then) {
                        result
                            .then(function () {
                                ch.ack(msg)
                            })
                            .catch(function (e) {
                                console.error("WORK exception", e)
                            })
                    } else {
                        ch.ack(msg)
                    }
                } catch (e) {
                    console.error("WORK exception", e)
                }
            },
            {noAck: false}
        )
    }
}

var initRabbit = function (rb) {
    return connect(rb).then(channel)
}

var createSender = function (exConf, routingKey) {
    return _channel
        .then(exchange(exConf))
        .then(sender(exConf, routingKey))
}

var createReceiver = function (exConf, routingKey, qConf, work) {
    return _channel
        .then(exchange(exConf))
        .then(queue(exConf, routingKey, qConf))
        .then(receiver(work, routingKey, qConf))
}

module.exports = {initRabbit, createSender, createReceiver}