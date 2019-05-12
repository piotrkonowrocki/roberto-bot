const moment = require('moment');
const Canvas = require('canvas');
const respond = require('./respond');
const log = require('../utils/log');
const getWebsiteContent = require('../utils/get-website-content');

const settings = require('../settings.json');

module.exports = class Schedule {
    constructor() {
        this.scheduleTimeRange = 24;
    }

    getSsrSchedule() {
        return new Promise((resolve, reject) => {
            log.print('Starting getting SSR raids schedule...');

            getWebsiteContent(settings.scheduleUrl)
                .then(this.getItems.bind(this))
                .then(this.filterItemsInTimeRange.bind(this))
                .then(this.filterSsrRaids.bind(this))
                .then(this.parseData.bind(this))
                .then(this.generateMessage.bind(this))
                .then(resolve)
                .catch(reject);
        });
    }

    getItems(document) {
        return new Promise(resolve => {
            resolve(document.querySelectorAll('.col-md-3'))
        });
    }

    filterItemsInTimeRange(items) {
        return new Promise(resolve => {
            let moment_next = moment().add(this.scheduleTimeRange, 'hours');
            let results = [];

            items.forEach(item => {
                let dom_localDate = item.querySelector('.local-date')
                let moment_begin = moment(parseInt(dom_localDate.getAttribute('data-begin'), 10) * 1000);

                if (moment_begin.isBefore(moment_next)) results.push(item);
            });

            resolve(results);
        });
    }

    filterSsrRaids(items) {
        return new Promise(resolve => {
            let results = [];

            items.forEach(item => {
                let dom_cardText = item.querySelector('.card-text a');
                let type = dom_cardText.textContent;

                if (type === 'SSR Raid') results.push(item);
            });

            resolve(results);
        });
    }

    parseData(items) {
        return new Promise(resolve => {
            let results = [];

            items.reduce((p, item, l) => {
                return p.then(this.parseDataSingleItem.bind(this, item))
                    .then(response => {
                        results.push(response);
                        if (l + 1 === items.length) resolve(results);
                    });
            }, Promise.resolve(resolve));
        });
    }

    parseDataSingleItem(item) {
        return new Promise(resolve => {
            let result = {};
            let dom_raidUrl = item.querySelector('a:first-of-type');
            let dom_raidConver = item.querySelector('img');
            let dom_localDate = item.querySelector('.local-date');
            let imgUrl = settings.host + dom_raidConver.getAttribute('data-original');
            let hubUrl = settings.host + dom_raidUrl.href;
            let moment_begin = moment(parseInt(dom_localDate.getAttribute('data-begin'), 10) * 1000);

            result.url = hubUrl;
            result.date = moment_begin.format('DD.MM');
            result.time = moment_begin.format('HH:mm');

            getWebsiteContent(hubUrl)
                .then(document => {
                    let dom_title = document.querySelector('nav li.active');
                    
                    result.title = dom_title.textContent.replace(' [Details]', '').trim();
                })
                .then(() => Canvas.loadImage(imgUrl))
                .then(img => {
                    result.img = img;

                    resolve(result);
                })
        });
    }

    generateMessage(items) {
        return new Promise(resolve => {
            let cc = {
                rows: 4,
                canvas: {},
                img: {
                    width: 200
                }
            };

            cc.img.height = Math.round(cc.img.width / items[0].img.width * items[0].img.height);
            cc.canvas.width = Math.min(items.length, cc.rows) * cc.img.width + Math.min(items.length, cc.rows) + 1;
            cc.canvas.height = Math.ceil(items.length / cc.rows) * cc.img.height + Math.ceil(items.length / cc.rows) + 1;

            let timeZone = moment().utcOffset() / 60;
            let message = [respond.print('ssrRaidsTitle', [this.scheduleTimeRange, timeZone])];
            let canvas = Canvas.createCanvas(cc.canvas.width, cc.canvas.height);
            let ctx = canvas.getContext('2d');

            ctx.font = '20px impact, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            items.forEach((item, i) => {
                let x = i % cc.rows * cc.img.width + i % cc.rows + 1;
                let y = Math.floor(i / cc.rows) * cc.img.height + Math.floor(i / cc.rows) + 1;

                message.push(`${item.date} ${item.time} - ${item.title} - <${item.url}>`);
                ctx.drawImage(item.img, x, y, cc.img.width, cc.img.height);
                ctx.strokeText(item.time, x + 11, y + 28);
                ctx.fillText(item.time, x + 11, y + 28);
            });

            log.print('Finished getting SSR raids schedule');

            resolve({message: message, canvas: canvas});
        });
    }
};
