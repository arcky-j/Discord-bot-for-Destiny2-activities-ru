const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
//команда контекстного меню для записи пользователя в кэш
module.exports = {
    data: new ContextMenuCommandBuilder()
            .setName('register')
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const user = interaction.targetUser;
        //записывает пользователя в кэш бота. всё
        await interaction.reply({content: `Вы успешно зарегистрировали ${user.tag}. т.е. записали в кэш.`, ephemeral:true});
    }
};