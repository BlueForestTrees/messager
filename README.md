# Messager (simple-rbmq)

Messager ou simple-rbmq est une mini-librairie permettant de communiquer via amqp (rabbitMq) en utilisant une serialisation BSON.

Cela permet d'envoyer des objets JSON/BSON en conservant les types (ObjectId, Date, etc.)

C'est un choix très pratique mais impactant: les messages sont binaires. Par exemple l'envoi d'un message texte par la console Rabbit provoquera l'erreur bson invalide.

La de/serialisation BSON est faite par la librairie, les utilisateurs peuvent donc directement envoyer et recevoir leurs messages sous forme d'objet JSON / BSON.

Types pris en charge par BSON: https://docs.mongodb.com/manual/reference/bson-types/

Exemple de communication:

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
