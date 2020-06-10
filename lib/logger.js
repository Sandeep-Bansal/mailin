'use strict';

var _ = require('lodash');
var util = require('util');
const { createLogger, format, transports } = require('winston');

var logger = createLogger({
    transports: [
        new transports.File({
            filename: 'error.log',
            level: 'error',
            format: format.json()
        }),
        new transports.Http({
            level: 'warn',
            format: format.json()
        }),
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'exceptions.log' })
    ]
});

logger.setLogFile = function(logFilePath) {

    logger.exceptions.handle(
        new transports.File({ filename: logFilePath })
    );
};

module.exports = logger;