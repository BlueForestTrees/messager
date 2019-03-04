#!/usr/bin/env node
var ENV = require("./env")
var closer = require("node-closer")
var rabbit = require("../src/index")

var BSON = require("bson")
var bson = new BSON()

closer(function () {
    console.log("graceful shutdown")
    process.exit()
})

rabbit.initRabbit(ENV.RB)
    .then(function () {
        return rabbit.createSender(ENV.RB.exchange, ENV.ROUTING_KEY)
    })
    .then(sendMsgs)

function sendMsgs(send) {
    let i = 0
    var doSend = function () {
        const msg = {
            _id: BSON.ObjectID(),
            date: new Date(),
            number: i,
            string: `Hello #${i}`
        }
        send(msg)

        console.log("sent:",msg)

        i++
    }
    closer(every(1000, doSend))
}

function every(delay, work) {
    var stop = false
    var call = function () {
        work()
        if (!stop) {
            setTimeout(call, delay)
        } else {
            console.log("stop every.")
        }
    }
    call()
    return function () {
        stop = true
    }
}