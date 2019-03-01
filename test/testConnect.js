import {expect} from 'chai'
import {connect} from "../src/index"
import ENV from "./env"

describe('connect then insert', async function () {

    it('Connect', async () => connect(ENV))

})