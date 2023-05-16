const {Events} = require('discord.js');
const {Settings} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        Settings.initSingle(guild);
    },
};