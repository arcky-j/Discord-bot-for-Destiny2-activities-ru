const {Events} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        //записывает пользователя в кэш
    },
};