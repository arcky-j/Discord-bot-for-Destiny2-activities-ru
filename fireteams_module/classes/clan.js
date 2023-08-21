const Base = require("./base");
const Settings = require('./settings');
const ActivitiyManager = require('../managment/actManager');
const GuardianManager = require('../managment/guardianManager');
const SettingsManager = require('../managment/settingsManager');
const {Collection} = require('discord.js');

class Clan extends Base{

    constructor(guild){
        super();
        this.id = guild.id;
        this.guild = guild;
        this.config = null;
        this.settings = new SettingsManager(this); 
        this.guardians = new GuardianManager(this);
        this.activities = new ActivitiyManager(this);
        setTimeout(() =>{
            setTimeout(() => {
                this.config.sendLog(`Инициализация завершена.\nЗагружено стражей: ${this.guardians.cache.size}\nЗагружено сборов: ${this.activities.cache.size}`, 'Запись логов: успех')
            }, 1000);
        }, 14000);
    }

    toString(){
        return `${this.guild.name}`;
    }
}

module.exports = Clan;