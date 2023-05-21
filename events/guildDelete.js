const {Events} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        guild.client.d2clans.delete(guild.id);
    },
};