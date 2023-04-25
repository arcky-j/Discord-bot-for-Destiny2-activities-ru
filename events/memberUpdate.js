const {Events, EmbedBuilder} = require('discord.js');
 //срабатывает, если пользователь на сервере изменился
module.exports = {
    name: Events.GuildMemberUpdate,
    
    async execute(oldMember, newMember) {
        if (oldMember.pending && !newMember.pending){
            const settings = newMember.client.settings.get(newMember.guild.id);
            if (settings.channelJoin){
                settings.sendAcceptAlert(newMember);
            }
            try {
                if (settings.rolesForNew.length > 0){
                    newMember.roles.add(settings.rolesForNew);
                }
            } catch (err){
                console.log('Ошибка с присвоением роли: ' + err.message);
            }            
        }
    },
};