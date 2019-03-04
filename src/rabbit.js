var rbmq = require('amqplib')
var debug = require('debug')('api:messager')
var ch //channel handle

var BSON = require("bson")
var bson = new BSON()


var connect = function (conf) {
    debug("connecting to %s", conf.url)
    return rbmq.connect(conf.url)
        .catch(function (e) {
            console.warn("connection problem. Retry in 1s")
            return connect(conf)
        })
}

var channel = function (c) {
    debug("connection ok. creating channel")
    return ch = c.createChannel()
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
                return ch.bindQueue(q.queue, exConf.key, routingKey)
            })
            .then(function (q) {
                return {ch: ch, q: q}
            })
    }
}

var sender = function (exConf, routingKey) {
    return function (ch) {
        debug("preparing a sender publishing on routingKey @%s", routingKey)
        return function (msg) {
            ch.publish(exConf.key, routingKey, bson.serialize(msg))
            return 1
        }
    }
}

var receiver = function (work, routingKey, qConf) {
    return function (ctx) {
        debug("preparing a receiver on queue %s from routingKey %s", qConf.name, routingKey)
        return ctx.ch.consume(
            ctx.q.queue,
            function (msg) {
                let json
                try {
                    json = bson.deserialize(msg.content)
                } catch (e) {
                    console.error(e.message, msg)
                }
                try {
                    var result = work(json)
                    if (result && result.then) {
                        result
                            .then(function () {
                                ctx.ch.ack(msg)
                            })
                            .catch(function (e) {
                                console.error("WORK exception", e)
                            })
                    } else {
                        ctx.ch.ack(msg)
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
    return ch.then(exchange(exConf))
        .then(sender(exConf, routingKey))
}

var createReceiver = function (exConf, routingKey, qConf, work) {
    return ch
        .then(exchange(exConf))
        .then(queue(exConf, routingKey, qConf))
        .then(receiver(work, routingKey, qConf))
}

module.exports = {initRabbit, createSender, createReceiver}