import {version} from './../package.json'

const debug = require('debug')('test:messager')

const ENV = {
    RABBIT_HOST : process.env.RABBIT_HOST || 'amqp://localhost',

    NODE_ENV: process.env.NODE_ENV || null,
    VERSION: version
};

debug({ENV})

export default ENV;