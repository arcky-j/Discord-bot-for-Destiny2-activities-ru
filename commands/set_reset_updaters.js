const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для выбора людей, ответственных за ресет
module.exports = {
    data: new SlashCommandBuilder()
            .setName('set_reset_updaters')
            .setDescription('Установить людей, отвечающих за ресеты')
            .addUserOption(option =>
                option.setName('пользователь1')
                    .setDescription('Первый пользователь'))
            .addUserOption(option =>
                option.setName('пользователь2')
                    .setDescription('Второй пользователь, если необходимо'))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const user1 = interaction.options.getUser('пользователь1');
        const user2 = interaction.options.getUser('пользователь2');
        //установка пользователей на оповещение
        interaction.client.reset.setUpdaters(user1, user2);
        //если пользователи не введены, уведомления получать никто не будет
        if (!user1 && !user2){
            await interaction.reply({content: `Вы успешно сбросили оповещения о ресете!`, ephemeral:true});
            return;
        }

        await interaction.reply({content: `Вы успешно определили пользователей ${user1.tag} и ${user2.tag} как ответственных за ресет!`, ephemeral:true});
    }
};