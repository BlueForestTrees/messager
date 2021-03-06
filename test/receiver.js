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
        return rabbit.createReceiver(
            ENV.RB.exchange,
            ENV.ROUTING_KEY,
            {...ENV.QUEUE, name: "debug"},
            function (msg) {
                console.log(msg)
            })
    })