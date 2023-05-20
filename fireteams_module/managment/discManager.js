const Base = require('../classes/base');
const path = require('node:path');
const fs = require('node:fs');

class DiscManager extends Base{

    constructor(){
        super();
        this.basePath = path.join('.', 'data');
        if (!fs.existsSync(this.basePath)){
            fs.mkdirSync(this.basePath, {recursive:true});
            console.log('Директория data была успешно создана.');
        }
    }


}

module.exports = DiscManager;