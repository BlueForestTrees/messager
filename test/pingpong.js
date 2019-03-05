#!/usr/bin/env node
var messager = require("../src/index")
var BSON = require("bson")

var rabbit = {url: "amqp://localhost"}
var exchange = {"key": "pingpong-exchange", "type": "direct", "options": {"durable": false}}
var routingKey = "routingKey"
var queue = {"name": "ping-pong-queue", "options": {"exclusive": false, "durable": false, "autoDelete": false}}

messager.initRabbit(rabbit)
    .then(function () {
        return messager.createSender(exchange, routingKey)
    })
    .then(function (send) {
        return messager.createReceiver(exchange, routingKey, queue, createResponder(send))
            .then(function () {
                return send
            })
    })
    .then(function (send) {
        send({objectId: BSON.ObjectID(), string: "Ping!", date: new Date()})
    })

var createResponder = function (send) {
    return function (msg) {
        console.log("Received:", msg)
        send({objectId: BSON.ObjectID(), string: "Pong!", respondTo: msg})
    }
}