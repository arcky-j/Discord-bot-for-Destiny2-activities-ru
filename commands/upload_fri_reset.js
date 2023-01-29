const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');
//команда для загрузки информации о пятничном ресете
module.exports = {
    data: new SlashCommandBuilder()
            .setName('upload_fri_reset')
            .setDescription('Команда для записи информации о пятничном ресете')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        //создание формы
        const modal = new ModalBuilder()
            .setTitle('Пятничный ресет')
            .setCustomId('reset_fri_modal');

        const xur = new TextInputBuilder()
            .setCustomId('reset_xur')
            .setLabel('Всё про Зура')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const trials = new TextInputBuilder()
            .setCustomId('reset_trials')
            .setLabel('Всё о испытаниях Осириса')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const row0 = new ActionRowBuilder().addComponents(xur);
        const row1 = new ActionRowBuilder().addComponents(trials);

        modal.addComponents(row0, row1);
        //отправка формы пользователю
        await interaction.showModal(modal);
    }
};