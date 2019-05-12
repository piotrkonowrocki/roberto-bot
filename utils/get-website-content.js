const request = require('request-promise-native');
const jsdom = require('jsdom');
const log = require('./log');

const {JSDOM} = jsdom;

module.exports = url => {
    return new Promise((resolve, reject) => {
        log.print(`Loading ${url}...`);
        request(url)
            .then(response => {
                let dom = new JSDOM(response);

                log.print(`Parsed ${url} into DOM`);

                resolve(dom.window.document);
            })
            .catch(err => {
                log.error(`Unable to get ${url} url`);

                reject(err);
            })
    });
};