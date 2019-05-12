const chalk = require('chalk');
const moment = require('moment');
const fs = require('fs');

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

    write(message) {
        let filename = `${new Date().getTime()}.log`;

        fs.writeFile(`./logs/${filename}`, message, err => {
            if (err) console.log(err);

            this.print(`Log written to ${filename} file`);
        });
    }
};

module.exports = new Log();
