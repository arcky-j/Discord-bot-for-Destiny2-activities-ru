const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const {Guardian} = require('../fireteams_module');
//команда контекстного меню для записи пользователя в кэш
module.exports = {
    data: new ContextMenuCommandBuilder()
            .setName('register')
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const user = interaction.targetUser;
        //записывает пользователя в кэш бота. всё
        const guardian = new Guardian(user);
        const clan = interaction.client.d2clans.get(interaction.guildId);
        if (clan.guardians.cache.has(user.id)){
            interaction.reply({content: `Пользователь ${user} уже зарегистрирован!`, ephemeral:true});
            return;
        }
        clan.guardians.set(guardian);
        interaction.reply({content: `Вы успешно зарегистрировали ${user}. т.е. записали в кэш и сохранили в файл`, ephemeral:true});
    }
};