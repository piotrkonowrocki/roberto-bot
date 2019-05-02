const chalk = require('chalk');
const moment = require('moment');

class Log {
    constructor() {
        if (Log.singletonInstance) return Log.singletonInstance;
        Log.singletonInstance = this;
    }

    error(message) {
        this.print(chalk.red(message));
    }

    print(message) {
        console.log(`[${chalk.gray(moment().format('HH:mm:ss'))}] ${message}`);
    }
};

module.exports = new Log();
