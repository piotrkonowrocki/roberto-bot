const Discord = require('discord.js');
const moment = require('moment');
const log = require('../utils/log');
const contains = require('../utils/contains');
const respond = require('./respond');
const BoostPeriod = require('./boost-period');

const token = require('../token.json').token;
const boostPeriod = new BoostPeriod();

module.exports = class Bot {
    constructor(settings) {
        this.settings = settings;
        this.client = new Discord.Client();

        this.client.login(token);
        this.events();
    }

    events() {
        this.client.once('ready', () => {
            log.print('Roberto-Bot ready and logged in');
        });

        this.client.on('message', message => {

            if (message.isMentioned(this.client.user)) {
                let content = message.content.toLowerCase();

                log.print(`User ${message.author.username} mentioned bot: ${message.content}`);

                if (contains(content, ['boost period'])) {
                    this.boostPeriodHandler(message);
                } else if (contains(content, ['hi', 'hello', 'hey'])) {
                    message.channel.send(respond.print('genericGreetings', `<@${message.author.id}>`))
                } else if (contains(content, ['thanks', 'thx', 'thank you', 'good job', 'good bot'])) {
                    message.channel.send(respond.print('genericThanks', `<@${message.author.id}>`))
                } else if (contains(content, ['what', 'why', 'when', 'who', 'which'])) {
                    message.channel.send(respond.print('genericAnswer'))
                }
            }
        });
    }

    respondWithError(message) {
        message.channel.send(respond.print('genericErrorMessage', '<@403690997764194325>'));
    }

    boostPeriodHandler(message) {
        message.channel.send(respond.print('boostPeriodLoading'));
        boostPeriod.getNearestBoost(this.settings.boostPeriodUrl)
            .then(response => {
                message.channel.send(response);
            })
            .catch(this.respondWithError.bind(this, message));
    }
};
