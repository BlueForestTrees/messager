#!/usr/bin/env node
var ENV = require("./env")
var closer = require("node-closer")
var rabbit = require("../src/index")

closer(function () {
    console.log("graceful shutdown")
    process.exit()
})

rabbit.initRabbit(ENV.RB)
    .then(function () {
        rabbit.createReceiver(ENV.RB.exchange, ENV.ROUTING_KEY, ENV.QUEUE, receiveMsg)
    })


var receiveMsg = function (msg) {
    console.log("%s RECEIVED: %s", new Date(), JSON.stringify(msg))
}
