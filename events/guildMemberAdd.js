const {Events, EmbedBuilder, GuildFeature} = require('discord.js');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        const settings = member.client.settings.get(member.guild.id);
        if (settings.channelJoin){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(settings.messageJoin.replace('#', `<@${member.user.id}>`)).setTimestamp(new Date());
            settings.channelJoin.send({embeds: [embed]}); //оповещает о прибытии
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