const {Events} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const {GuardianEvents} = require('../fireteams_module');
//срабатывает при уходе пользователя с сервера
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const clan = member.client.d2clans.get(member.guild.id);         
        clan.config.sendLeaveAlert(member);  
        const guardian = clan.guardians.get(member.id);
        clan.guardians.delete(member.id);    
        member.client.emit(GuardianEvents.Deleted, guardian);
    },
};