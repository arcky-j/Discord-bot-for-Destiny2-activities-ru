const DiscManager = require('./discManager');
const CustomActivitiesManager = require('./custActManager');
const FireteamsUntimedManager = require('./fireUnManager');
const FireteamsResManager = require('./fireResManager');
const CustomActivity = require('../classes/customActivity');
const FireteamRes = require('../classes/fireteamRes');
const FireteamUntimed = require('../classes/fireteamUntimed');
const {Collection} = require('discord.js');

class MainActivityManager extends DiscManager{
    
    constructor(clan){
        super();
        this.cache = new Collection();
        this.customActivitiesManager = new CustomActivitiesManager(clan);
        this.fireteamsResManager = new FireteamsResManager(clan);
        this.fireteamsUntimedManager = new FireteamsUntimedManager(clan);
        setTimeout(() => this.initAll(), 10000);
    }

    set(fireteam){
        this.cache.set(fireteam.id, fireteam);
        this.save(fireteam);
    }

    get(id){
        return this.cache.get(id);
    }

    async initAll(){
        this.customActivitiesManager.initAll().catch(err => console.log(`Ошибка загрузки кастомных сборов: ${err.message}`));
        this.fireteamsResManager.initAll().catch(err => console.log(`Ошибка загрузки стандартных сборов: ${err.message}`)); 
        this.fireteamsUntimedManager.initAll().catch(err => console.log(`Ошибка загрузки сборов по готовности: ${err.message}`));
    }

    save(fireteam){
        if (fireteam instanceof CustomActivity){
            this.customActivitiesManager.save(fireteam);
        }

        if (fireteam instanceof FireteamRes){
            this.fireteamsResManager.save(fireteam);
        }

        if (fireteam instanceof FireteamUntimed){
            this.fireteamsUntimedManager.save(fireteam);
        }
    }

    delete(fireteam){
        this.cache.delete(fireteam.id);
        if (fireteam instanceof CustomActivity){
            this.customActivitiesManager.delete(fireteam);
        }

        if (fireteam instanceof FireteamRes){
            this.fireteamsResManager.delete(fireteam);
        }

        if (fireteam instanceof FireteamUntimed){
            this.fireteamsUntimedManager.delete(fireteam);
        }
    }
}

module.exports = MainActivityManager;