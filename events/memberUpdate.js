const {Events} = require('discord.js');
 //срабатывает, если пользователь на сервере изменился
module.exports = {
    name: Events.GuildMemberUpdate,
    
    async execute(oldMember, newMember) {
        if (oldMember.pending && !newMember.pending){
            const settings = newMember.client.d2clans.getConfig(newMember.guild.id);
            if (settings.rolesForNew.length > 0){
                await newMember.roles.add(settings.rolesForNew).catch(err => {
                    console.log(`Ошибка с присвоением роли новичку сервера (${newMember.user.tag}): ${err.message}`);
                    settings.sendLog(`Не удалось присвоить роль/роли новичку сервера (${newMember}): ${err.message}`, 'Запись логов: ошибка');           
                });
            } 
            settings.sendAcceptAlert(newMember);                   
        }
    },
};