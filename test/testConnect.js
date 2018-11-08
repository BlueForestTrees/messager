import {expect} from 'chai'

import {mqInit} from "../src"
import ENV from "./env"

describe('connect then insert', async function () {

    it('Connect', () =>
        mqInit(ENV)
    )

    it('Insert', () =>
        mqInit(ENV).channel("test").send("Salut")
    )

    it('Insert-Find', () => {
            mqInit(ENV).channel("test").send("Salut")
            mqInit(ENV).channel("test").receive(o => {
                console.log(o)
            })
        }
    )

})