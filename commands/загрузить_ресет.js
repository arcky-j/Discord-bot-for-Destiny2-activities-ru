const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');
//команда для загрузки информации о ресете
module.exports = {
    data: new SlashCommandBuilder()
            .setName('загрузить_ресет')
            .setDescription('Команда для записи информации о ресете')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        //создание формы
        const modal = new ModalBuilder()
            .setTitle('Ресет')
            .setCustomId('reset_modal');
        
        const info = new TextInputBuilder()
            .setCustomId('reset_info')
            .setLabel('Любая дополнительная информация о ресете')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const nf = new TextInputBuilder()
            .setCustomId('reset_nf')
            .setLabel('Сумрачный налёт')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const bonus = new TextInputBuilder()
            .setCustomId('reset_bonus')
            .setLabel('Бонусная репутация')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const raid = new TextInputBuilder()
            .setCustomId('reset_raid')
            .setLabel('Рейд в ротации')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const dung = new TextInputBuilder()
            .setCustomId('reset_dung')
            .setLabel('Подземелье в ротации')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row0 = new ActionRowBuilder().addComponents(info);
        const row1 = new ActionRowBuilder().addComponents(nf);
        const row2 = new ActionRowBuilder().addComponents(bonus);
        const row3 = new ActionRowBuilder().addComponents(raid);
        const row4 = new ActionRowBuilder().addComponents(dung);

        modal.addComponents(row0, row1, row2, row3, row4);
        //отправка формы пользователю
        await interaction.showModal(modal);
    }
};