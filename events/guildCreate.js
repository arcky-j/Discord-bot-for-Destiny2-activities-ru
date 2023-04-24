const {Events, EmbedBuilder, GuildFeature} = require('discord.js');
const Settings = require('../entities/settings.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        Settings.initSingle(guild);
    },
};