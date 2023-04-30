const {Events, EmbedBuilder, GuildFeature} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const settings = member.client.settings.get(member.guild.id);
        if (!settings){
            return;
        }
        if (settings.channelJoin){
            settings.sendJoinAlert(member); //оповещает о прибытии
        }
        if (settings.rolesForNew.length > 0 && !member.guild.features.includes(GuildFeature.MemberVerificationGateEnabled)){
            member.roles.add(settings.rolesForNew).catch(err => {
                console.log(`Ошибка с присвоением роли новичку сервера (${member.user.tag}): ${err.message}`);               
                const sett = member.client.settings.get(member.guild.id);
                sett.sendLog(`Не удалось присвоить роль/роли новичку сервера (${member}): ${err.message}`, 'Запись логов: ошибка');           
            });
        }
        
    },
};