const {Events, EmbedBuilder, GuildFeature} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildDelete,
    execute(guild) {
        const settings = guild.client.settings.get(guild.id);
        settings.delete();
    },
};