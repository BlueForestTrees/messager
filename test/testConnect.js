import {expect} from 'chai'
import {mqInit} from "../src/index"
import ENV from "./env"

describe('connect then insert', async function () {

    it('Connect', async () => mqInit(ENV))

    it('Insert', () => mqInit(ENV).then(co => {
        return co.createChannel().then(ch => {
            const msg = 'Hello World!'
            let tc = 'trunkCreation'


            ch.assertExchange(tc, 'fanout', {durable: false})
            ch.publish(tc, '', new Buffer(msg))
            console.log(" [x] Sent %s", msg)


            ch.assertExchange(tc, 'fanout', {durable: false})
            return ch.assertQueue('', {exclusive: true})
                .then(q => {
                    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue)
                    ch.bindQueue(q.queue, tc, '')

                    return ch.consume(
                        q.queue,
                        msg => {
                            if (msg.content) {
                                console.log(" [x] %s", msg.content.toString())
                            }
                        },
                        {noAck: true}
                    )
                })
        })
    }))

})