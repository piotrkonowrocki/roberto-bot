const jsdom = require('jsdom');
const request = require('request-promise-native');
const moment = require('moment');
const respond = require('./respond');

const {JSDOM} = jsdom;

module.exports = class BoostPeriod {
    getWebsiteContent(url) {
        return new Promise(resolve => {
            request(url)
                .then(response => {
                    let dom = new JSDOM(response);

                    resolve(dom.window.document);
                });
        });
    }

    getNearestBoost(url) {
        return new Promise((resolve, reject) => {
            this.getWebsiteContent(url)
                .then(document => {
                    let documentTr = document.querySelector('table tbody tr:first-child');

                    if (documentTr) {
                        let documentSpan = documentTr.querySelector('td:nth-child(2) span');
                        let timeUpcoming = moment(parseInt(documentSpan.getAttribute('data-timestamp'), 10) * 1000);
                        let timeZone = moment().utcOffset() / 60;
                        let timeNow = moment();

                        if (timeUpcoming.isAfter(timeNow)) {
                            let timeLeft = timeNow.to(timeUpcoming, true);
                            let hour = timeUpcoming.format('HH:mm');

                            resolve(respond.print('boostPeriodIn', [timeLeft, hour, timeZone]));
                        } else {
                            resolve(respond.print('boostPeriodNow'));
                        }
                    } else {
                        resolve(respond.print('boostPeriodOff'));
                    }
                })
                .catch(err => {
                    console.log(err);

                    reject();
                });
        });
    }
};
