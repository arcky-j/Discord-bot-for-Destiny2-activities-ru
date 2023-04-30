const {Events} = require('discord.js');
//срабатывает при уходе пользователя с сервера
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const client = member.client;
        const settings = client.settings.get(member.guild.id);
        if (!settings){
            return;
        }
        if (settings.channelLeave){           
            settings.sendLeaveAlert(member);
        }           
    },
};