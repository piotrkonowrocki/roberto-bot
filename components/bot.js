const Discord = require('discord.js');
const log = require('../utils/log');
const BoostPeriod = require('./boost-period');

const token = require('../token.json').token;

module.exports = class Bot {
    constructor(settings) {
        this.client = new Discord.Client();
        this.boostPeriod = new BoostPeriod(settings.boostPeriodUrl);

        this.events();
        this.client.login(token);
    }

    events() {
        this.client.once('ready', () => {
            log.print('Bot ready');
        });
    }
};
