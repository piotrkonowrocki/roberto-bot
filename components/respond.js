const responses = require('../responses.json');

class Respond {
    constructor() {
        if (Respond.singletonInstance) return Respond.singletonInstance;
        Respond.singletonInstance = this;
    }

    print(key, vars) {
        let response = responses[key];

        if (Array.isArray(response)) {
            response = response[Math.floor(Math.random() * response.length)];
        }

        if (vars) {
            let responseArray = response.split('{placeholder}');

            if (!Array.isArray(vars)) vars = [vars];
            response = '';
            responseArray.forEach((item, i) => {
                response += item;
                if (vars[i] && responseArray.length > 1) response += vars[i];
            })
            
        }

        return response;
    }
};

module.exports = new Respond();