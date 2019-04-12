var rbmq = require('amqp-connection-manager')
var warn = require('debug')('api:warn:messager')
var BSON = require("bson")
var bson = new BSON()
var chWr

var initRabbit = function (rb) {
    const c = rbmq.connect(rb.urls || [rb.url])
    c.on('connect', () => warn('Connected!'))
    c.on('disconnect', params => warn('Disconnected.', params.err.message))

    chWr = c.createChannel({
        setup: function (ch) {
            const setups = [
                ch.assertExchange(rb.exchange.key, rb.exchange.type, rb.exchange.options)
            ]
            rb.channel && rb.channel.prefetch && setups.push(ch.prefetch(rb.channel.prefetch))
            return Promise.all(setups)
        }
    })
    return Promise.resolve()
}

var createSender = function (exConf, routingKey) {
    return function (msg) {
        return chWr.publish(exConf.key, routingKey, bson.serialize(msg))
    }
}

var createReceiver = function (exConf, routingKey, qConf, work) {
    return chWr.addSetup(function (ch) {
        return Promise.all([
            ch.assertQueue(qConf.name, qConf.options),
            ch.bindQueue(qConf.name, exConf.key, routingKey),
            ch.consume(qConf.name, onMessage(work), {noAck: false})
        ])
    })
}

var onMessage = function (work) {
    return function (msg) {
        let json
        try {
            json = bson.deserialize(msg.content)
        } catch (e) {
            console.error(e.message, Buffer.from(msg.content).toString())
            chWr.ack(msg)
            return
        }
        try {
            var result = work(json)
            if (result && result.then) {
                result
                    .then(function () {
                        chWr.ack(msg)
                    })
                    .catch(function (e) {
                        console.error("in receiver", e)
                    })
            } else {
                chWr.ack(msg)
            }
        } catch (e) {
            console.error("in receiver", e)
        }
    }
}

module.exports = {initRabbit, createSender, createReceiver}