const {Events, Collection} = require('discord.js');
//срабатывает при уходе пользователя с сервера
module.exports = {
    name: Events.GuildMemberRemove,
    execute(member) {
        const client = member.client;
        const settings = client.settings.get(member.guild.id);
        if (settings.channelLeave){
            settings.channelLeave.send(settings.messageLeave.replace('#', `<@${member.user.id}> (${member.user.tag})`)); //оповещает об уходе
        }
        //удаляет его из кэшэй
        if (client.users.cache.has(member.user.id)){
            client.users.cache.delete(member.user.id);
            client.cacheManager.saveCache();
        }
        if (member.guild.members.cache.has(member.id)){
            member.guild.members.cache.delete(member.id);
        }
    },
};