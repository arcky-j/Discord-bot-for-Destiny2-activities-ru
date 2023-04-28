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
            if (settings.rolesForNew.length > 0){
                newMember.roles.add(settings.rolesForNew).catch(err => {
                    console.log(`Ошибка с присвоением роли новичку сервера (${newMember.user.tag}): ${err.message}`);               
                    const sett = member.client.settings.get(newMember.guild.id);
                    sett.sendLog(`Не удалось присвоить роль/роли новичку сервера (${newMember}): ${err.message}`, 'Запись логов: ошибка');           
                });
            }           
        }
    },
};