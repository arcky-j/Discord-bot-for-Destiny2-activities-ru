const {Events, EmbedBuilder, GuildFeature} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const settings = member.client.settings.get(member.guild.id);
        if (settings.channelJoin){
            settings.sendJoinAlert(member); //оповещает о прибытии
        }
        try {
            if (settings.rolesForNew.length > 0 && !member.guild.features.includes(GuildFeature.MemberVerificationGateEnabled)){
                member.roles.add(settings.rolesForNew);
            }
        } catch (err){
            console.log('Ошибка с присвоением роли: ' + err.message);
        }
        
    },
};