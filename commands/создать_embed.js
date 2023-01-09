const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');
//команда для отмены существующего сбора
module.exports = {
    data: new SlashCommandBuilder()
            .setName('создать_embed')
            .setDescription('Создаёт форму для создания embed-сообщения'),

    async execute (interaction){
        //создаёт форму для записи данных в embed-сообщение
        const modal = new ModalBuilder()
            .setCustomId('create_embed')
            .setTitle('Создание Embed-сообщения');
        
        const embedTitle = new TextInputBuilder()
            .setCustomId('embedTitle')
            .setLabel('Заголовок вашего сообщения')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        
        const embedDesc = new TextInputBuilder()
            .setCustomId('embedDesc')
            .setLabel('Содержание вашего сообщения')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        
        const actionRow0 = new ActionRowBuilder().addComponents(embedTitle);
        const actionRow1 = new ActionRowBuilder().addComponents(embedDesc);

        modal.addComponents(actionRow0, actionRow1);
        //отправляет форму пользователю
        await interaction.showModal(modal);
    }
};