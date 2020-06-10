'use strict';

var child_process = require('child_process');
var shell = require('shelljs');
var logger = require('./logger');
var path = require('path');
var Spamc = require('spamc');
var spamc = new Spamc();
const rspamdClient = require("rspamd-client");
const rclient = rspamdClient();

const dkimVerify = require('python-dkim-verify');
const spfCheck2 = require('python-spfcheck2');

/* Verify Python availability. */
var isPythonAvailable = shell.which('python');
if (!isPythonAvailable) {
    logger.warn('Python is not available. Dkim and spf checking is disabled.');
}

/* Verify spamc/spamassassin availability. */
var isSpamcAvailable = true;
if (!shell.which('spamassassin') || !shell.which('spamc')) {
    logger.warn('Either spamassassin or spamc are not available. Spam score computation is disabled.');
    isSpamcAvailable = false;
}

var isRSpamdAvailable = true;
if (!shell.which("rspamd")) {
    logger.warn('RspamD is not running');
    isRSpamdAvailable = false;
}

/* Provides high level mail utilities such as checking dkim, spf and computing
 * a spam score. */
module.exports = {
    /* @param rawEmail is the full raw mime email as a string. */
    validateDkim: function(rawEmail, callback) {
        (async () => {
            try {
                logger.verbose(rawEmail);
                const result = await dkimVerify(rawEmail);
                logger.verbose(result.toString());
                return callback(null, result);
            } catch (err) {
                console.error(err);
            }
        })();
    },

    validateSpf: function(ip, address, host, callback) {
        (async () => {
            try {
                const [result, explanation] = await spfCheck2(ip, address, host);
                logger.verbose(result, explanation);
                return callback(null, result);
            } catch (err) {
                console.error(err);
            }
        })();
    },

    /* @param rawEmail is the full raw mime email as a string. */
    computeSpamScore: function(rawEmail, provider, callback) {

        if (provider == "spamassassin") {
            if (!isSpamcAvailable) {
                return callback(null, 0.0);
            }

            spamc.report(rawEmail, function(err, result) {
                logger.verbose(result);
                if (err) logger.error(err);
                if (err) return callback(new Error('Unable to compute spam score.'));
                callback(null, result.spamScore);
            });
        }

        if (provider == "rspamd") {
            if (!isRSpamdAvailable) {
                return callback(null, 0.0);
            }

            rclient.check(path, (err, result) => {
                logger.verbose(result);
                if (err) logger.error(err);
                if (err) return callback(new Error('Unable to compute spam score.'));
                return callback(null, result.score);
            });
        }
    }
};