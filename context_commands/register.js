const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const {Guardian, GuardianEvents} = require('../fireteams_module');
//команда контекстного меню для записи пользователя в кэш
module.exports = {
    data: new ContextMenuCommandBuilder()
            .setName('register')
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const user = interaction.targetMember;
        const clan = interaction.client.d2clans.get(interaction.guildId);
        if (clan.guardians.cache.has(user.id)){
            interaction.reply({content: `Пользователь ${user} уже зарегистрирован!`, ephemeral:true});
            return;
        }
        const guardian = new Guardian(user, clan);
        clan.guardians.set(guardian);
        activity.client.emit(GuardianEvents.Registered, guardian);
        interaction.reply({content: `Вы успешно сохранили ${user}!`, ephemeral:true});
    }
};