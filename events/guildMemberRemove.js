const {Events, EmbedBuilder, Collection} = require('discord.js');
//срабатывает при уходе пользователя с сервера
module.exports = {
    name: Events.GuildMemberRemove,
    execute(member) {
        const client = member.client;
        const settings = client.settings.get(member.guild.id);
        if (settings.channelLeave){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(settings.messageLeave.replace('#', `${member.user.tag}`)).setTimestamp(new Date());
            settings.channelLeave.send({embeds: [embed]}); //оповещает об уходе
        }
        //удаляет его из кэшэй
        if (member.guild.members.cache.has(member.id)){
            member.guild.members.cache.delete(member.id);
        }
        if (client.users.cache.has(member.user.id)){
            client.users.cache.delete(member.user.id);
        }       
    },
};