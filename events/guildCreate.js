const {Events} = require('discord.js');
const {Clan} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        guild.client.d2clans.initSingle(guild);
    },
};