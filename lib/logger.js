'use strict';

var _ = require('lodash');
var util = require('util');
const { createLogger, format, transports } = require('winston');

var logger = createLogger({
    transports: [
        new transports.Console({
            level: 'error',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        new transports.Console({
            level: 'warn',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
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
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    ]
});


logger.setLogFile = function(logFilePath) {
    
};

module.exports = logger;