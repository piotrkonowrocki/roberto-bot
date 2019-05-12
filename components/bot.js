const Discord = require('discord.js');
const cron = require('node-cron');
const BoostPeriod = require('./boost-period');
const Schedule = require('./schedule');
const respond = require('./respond');
const log = require('../utils/log');
const contains = require('../utils/contains');

const token = require('../token.json').token;
const boostPeriod = new BoostPeriod();
const schedule = new Schedule();

module.exports = class Bot {
    constructor() {
        this.debug = true;
        this.client = new Discord.Client();

        this.client.login(token);
        this.client.once('ready', () => {
            log.print('Roberto-Bot ready and logged in');

            this.events();
            this.cron();
        });
    }

    events() {
        this.client.once('ready', () => {
            log.print('Roberto-Bot ready and logged in');
        });

        this.client.on('message', message => {
            if (message.isMentioned(this.client.user) && this.client.user !== message.author) {
                let content = message.content.toLowerCase().trim();

                log.print(`User ${message.author.username} mentioned bot: ${message.content}`);

                if (contains(content, ['boost period'])) {
                    this.boostPeriodHandler(message);
                } else if (contains(content, ['raid schedule', 'raids schedule'])) {
                    this.ssrScheduleHandler(message);
                } else if (contains(content, ['hi', 'hello', 'hey'])) {
                    message.channel.send(respond.print('genericGreetings', `<@${message.author.id}>`))
                } else if (contains(content, ['thanks', 'thx', 'thank you', 'good job', 'good bot'])) {
                    message.channel.send(respond.print('genericThanks', `<@${message.author.id}>`))
                } else if (contains(content, ['what', 'why', 'when', 'who', 'which'])) {
                    message.channel.send(respond.print('genericAnswer'))
                } else if (content === '<@573266061768523855>') {
                    message.channel.send(respond.print('genericMention', `<@${message.author.id}>`));
                } else {
                    message.channel.send(respond.print('genericResponse'));
                }
            }
        });
    }

    cron() {
        cron.schedule('0 0 0 * * *', () => {
            console.log(Math.random());
        });
    }

    respondWithError(err, message) {
        log.error('Error occured, unable to respond');
        log.write(err.stack);
        message.channel.send(respond.print('genericErrorMessage', '<@403690997764194325>'));
    }

    boostPeriodHandler(message) {
        message.channel.send(respond.print('boostPeriodLoading'));
        boostPeriod.getNearestBoost()
            .then(response => {
                message.channel.send(response.message);
            })
            .catch(err => this.respondWithError(err, message));
    }

    ssrScheduleHandler(message) {
        message.channel.send(respond.print('ssrRaidsLoading'));
        schedule.getSsrSchedule()
            .then(response => {
                let attachment = new Discord.Attachment(response.canvas.toBuffer(), 'schedule.png');

                message.channel.send(response.message, attachment);
            })
            .catch(err => this.respondWithError(err, message));
    }
};
