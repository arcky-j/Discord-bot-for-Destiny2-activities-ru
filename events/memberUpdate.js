const {Events} = require('discord.js');
 //срабатывает, если пользователь на сервере изменился
module.exports = {
    name: Events.GuildMemberUpdate,
    
    execute(oldMember, newMember) {
        if (oldMember.pending && !newMember.pending){
            const settings = newMember.client.settings.get(newMember.guild.id);
            if (settings.channelJoin){
                settings.channelJoin.send(settings.messageJoin.replace('#', `<@${newMember.user.id}>`)); //оповещает о прибытии
            }
            if (settings.rolesForNew.length > 0){
                newMember.roles.add(settings.rolesForNew);
            }
        }
    },
};