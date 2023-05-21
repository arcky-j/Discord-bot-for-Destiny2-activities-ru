const {Events} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
//срабатывает при уходе пользователя с сервера
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const clan = member.client.d2clans.get(member.guild.id);
        const settings = clan.settings.config;
        if (!settings){
            return;
        }
        if (settings.channelLeave){           
            settings.sendLeaveAlert(member);
        }           
    },
};