# Messager (simple-rbmq)

Messager or simple-rbmq is a JS lib that allow communication via amqp (rabbitMq) using BSON serialization.

https://www.npmjs.com/package/simple-rbmq

Like that you can send BSON conserving its dataypes (ObjectId, Date, etc.)
BSON De/serialization is done internally (with bson 1.1.0 and bson 4 soon), users can directly send and receive their BSON/JSON messages.

Note it's an impacting choice: messages are binary, you can only see them with a BSON deserialization (provided by this lib). For example sending a message with Rabbit console will throw an invalid BSOB error.

BSON types: https://docs.mongodb.com/manual/reference/bson-types/

Example:
*The example creates a sender and a receiver, and send ping messages to itself.*

```javascript
#!/usr/bin/env node
var messager = require("../src/index")
var BSON = require("bson")

var rabbit = {url: "amqp://localhost"}
var exchange = {"key": "pingpong-exchange", "type": "direct", "options": {"durable": false}}
var routingKey = "routingKey"
var queue = {"name": "ping-pong-queue", "options": {"exclusive": false, "durable": false, "autoDelete": false}}

messager.initRabbit(rabbit)//connect to rabbit
    .then(function () {
        //createSender: assert exchange + create send to routingkey function
        return messager.createSender(exchange, routingKey)
    })
    .then(function (send) {
        //create receiver: assert exchange + assert queue + bind queue + handle received messages
        return messager.createReceiver(exchange, routingKey, queue, createResponder(send))
            .then(function () { //return send for first send
                return send
            })
    })
    .then(function (send) {//first send to initiate "ping pong pong pong..." example/
        send({objectId: BSON.ObjectID(), string: "Ping!", date: new Date()})
    })

//createReceiver will take function(msg) returned here as message handler
var createResponder = function (send) {
    return function (msg) {
        console.log("Received:", msg)
        send({objectId: BSON.ObjectID(), string: "Pong!", respondTo: msg})
    }
}
```
