const Base = require("./base");
const Settings = require('./settings');
const MainActivitiesManager = require('../managment/mainActManager');
const GuardianManager = require('../managment/guardianManager');
const SettingsManager = require('../managment/settingsManager');
const {Collection} = require('discord.js');

class Clan extends Base{

    constructor(guild){
        super();
        this.id = guild.id;
        this.guild = guild;
        this.settings = new SettingsManager(this); 
        this.activities = new MainActivitiesManager(this);
        this.guardians = new GuardianManager(this);      
    }
}

module.exports = Clan;