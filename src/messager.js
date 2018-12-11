import rbmq from 'amqplib'

const debug = require('debug')('api:messager')

export const mqInit = ENV => {
    debug("CONNECTING TO %o", ENV.RABBIT_HOST)
    return rbmq.connect(ENV.RABBIT_HOST)
        .then(conn => {
            debug("CONNECTED")
            return conn
        })
}

