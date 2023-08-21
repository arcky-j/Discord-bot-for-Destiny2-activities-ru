const {Events, GuildFeature} = require('discord.js');
const {Guardian, GuardianEvents} = require('../fireteams_module');
const fs = require('node:fs');
const path = require('node:path');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const clan = member.client.d2clans.get(member.guild.id);
        clan.config.sendJoinAlert(member); //оповещает о прибытии

        if (clan.config.rolesForNew.length > 0 && !member.guild.features.includes(GuildFeature.MemberVerificationGateEnabled)){
            member.roles.add(clan.config.rolesForNew).catch(err => {
                console.log(`Ошибка с присвоением роли новичку сервера (${member.user.tag}): ${err.message}`);
                clan.config.sendLog(`Не удалось присвоить роль/роли новичку сервера (${member}): ${err.message}`, 'Запись логов: ошибка');           
            });
        }
        const guardian = new Guardian(member, clan);
        clan.guardians.set(guardian);
        member.client.emit(GuardianEvents.Registered, guardian);
    },
};