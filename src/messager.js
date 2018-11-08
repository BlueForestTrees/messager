import rbmq from 'amqplib/callback_api'

const debug = require('debug')('api:mongo-registry')

let conn = null

const mqInit = ENV => new Promise((resolve, reject) => {
    debug("CONNECTING TO %o", ENV.RABBIT_HOST)
    rbmq.connect(ENV.RABBIT_HOST, function (err, conn) {
        if (err) {
            reject(err)
        } else {
            conn = c
            debug("CONNECTED")
            resolve(conn)
        }
    })

})