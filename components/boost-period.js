const moment = require('moment');
const respond = require('./respond');
const log = require('../utils/log');
const getWebsiteContent = require('../utils/get-website-content');

const settings = require('../settings.json');

module.exports = class BoostPeriod {
    getNearestBoost() {
        return new Promise((resolve, reject) => {
            log.print('Starting getting nearest boost period...');

            getWebsiteContent(settings.boostPeriodUrl)
                .then(document => {
                    let dom_firstRow = document.querySelector('table tbody tr:first-child');

                    if (dom_firstRow) {
                        let dom_timestamp = dom_firstRow.querySelector('td:nth-child(2) span');
                        let moment_upcoming = moment(parseInt(dom_timestamp.getAttribute('data-timestamp'), 10) * 1000);
                        let moment_now = moment();
                        let timeZone = moment().utcOffset() / 60;

                        if (moment_upcoming.isAfter(moment_now)) {
                            let timeLeft = moment_now.to(moment_upcoming, true);
                            let hour = moment_upcoming.format('HH:mm');

                            resolve(respond.print('boostPeriodIn', [timeLeft, hour, timeZone]));
                        } else {
                            resolve(respond.print('boostPeriodNow'));
                        }
                    } else {
                        resolve(respond.print('boostPeriodOff'));
                    }    
                    log.print('Finished getting nearest boost period');
                })
                .catch(err => {
                    console.log(err);

                    reject();
                });
        });
    }
};
