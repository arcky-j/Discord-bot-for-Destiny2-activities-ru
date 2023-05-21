const {Events, GuildFeature} = require('discord.js');
const {Guardian} = require('../fireteams_module');
const fs = require('node:fs');
const path = require('node:path');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const clan = member.client.d2clans.get(member.guild.id);
        const settings = clan.settings.config;
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
        const guardian = new Guardian(member);
        clan.guardians.save(guardian);
    },
};