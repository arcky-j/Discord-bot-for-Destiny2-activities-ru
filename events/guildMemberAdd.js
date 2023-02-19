const {Events} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        // const settings = member.client.settings.get(member.guild.id);
        // if (settings.channelJoin){
        //     settings.channelJoin.send(settings.messageJoin.replace('#', `<@${member.user.id}>`)); //оповещает о прибытии
        // }
        // if (settings.rolesForNew.length > 0){
        //     member.roles.add(settings.rolesForNew);
        // }
    },
};