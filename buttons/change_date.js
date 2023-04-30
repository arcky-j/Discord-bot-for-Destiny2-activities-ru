const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');
const CustomActivity = require('../entities/customActivity');

module.exports = {
    name: 'change_date',
    async execute(interaction){          
        const message = interaction.message;    
        const activity = interaction.client.activities.get(message.customId);
        if (!activity || activity.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (activity.leader.id != interaction.user.id){
            const embed = interaction.client.genEmbed(`Настраивать сбор может только лидер`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }      

        const modal = new ModalBuilder()
        .setCustomId('change_date')
        .setTitle('Изменение даты сбора');

        if (activity instanceof CustomActivity){
            const date = new TextInputBuilder()
            .setCustomId('date')
            .setLabel('Новая дата активности')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Никаких форматов. Просто строка с приблизительной датой/временем')
            .setRequired(true);

            const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Причина переноса')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Если хотите, укажите причину переноса сбора')
            .setRequired(false);

            const row0 = new ActionRowBuilder().addComponents(date);
            const row1 = new ActionRowBuilder().addComponents(reason);
            modal.addComponents(row0, row1);
        } else {
            const time = new TextInputBuilder()
            .setCustomId('time')
            .setLabel('Новое время активности (МСК)')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(5)
            .setPlaceholder('Время в формате "ЧЧ:ММ", например, "18:30"')
            .setRequired(true);

            const date = new TextInputBuilder()
            .setCustomId('date')
            .setLabel('Новая дата активности')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(8)
            .setPlaceholder('Оставьте поле пустым, чтобы использовать сегодняшнюю дату. Формат "ДД.ММ"')
            .setRequired(false);

            const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Причина переноса')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Если хотите, укажите причину переноса сбора')
            .setRequired(false);

            const actionRow0 = new ActionRowBuilder().addComponents(time);
            const actionRow1 = new ActionRowBuilder().addComponents(date);
            const actionRow2 = new ActionRowBuilder().addComponents(reason);
            modal.addComponents(actionRow0, actionRow1, actionRow2);
        }
        await interaction.showModal(modal);       
          
    }
}