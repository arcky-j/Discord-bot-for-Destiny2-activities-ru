const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    async execute(interaction, activity, user){
        const modal = new ModalBuilder()
        .setCustomId(`changeDate_${activity.id}`)
        .setTitle('Изменение даты сбора');

        const timeT = new TextInputBuilder()
        .setCustomId('time')
        .setLabel('Новое время активности (МСК)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(5)
        .setPlaceholder('Время в формате "ЧЧ:ММ", например, "18:30"')
        .setRequired(true);

        const dateT = new TextInputBuilder()
        .setCustomId('date')
        .setLabel('Новая дата активности')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(8)
        .setPlaceholder('Оставьте поле пустым, чтобы использовать сегодняшнюю дату. Формат "ДД.ММ"')
        .setRequired(false);

        const reasonT = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Причина переноса')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Если хотите, укажите причину переноса сбора')
        .setRequired(false);

        const actionRow0 = new ActionRowBuilder().addComponents(timeT);
        const actionRow1 = new ActionRowBuilder().addComponents(dateT);
        const actionRow2 = new ActionRowBuilder().addComponents(reasonT);
        modal.addComponents(actionRow0, actionRow1, actionRow2);            
        
        await interaction.showModal(modal);  
        
        const filter = (interactionM) => interactionM.customId === `changeDate_${activity.id}`;
        const modalInt = await interaction.awaitModalSubmit({filter, time: 300000})
        .catch(error => console.log(error));
        if (!modalInt){
            const row = activity.createActionRow();
            interaction.message.edit({components: [row]}); 
            return;
        }
        const reason = modalInt.fields.getTextInputValue('reason');
          
        const time = modalInt.fields.getTextInputValue('time');
        const date = modalInt.fields.getTextInputValue('date');
        let rDate;
        try {
            rDate = interaction.client.d2clans.utility.dateSet(time, date);
        } catch (err) {
            const embed = interaction.client.genEmbed(`Не удалось установить дату: ${err.message}`, 'Ошибка!');
            modalInt.reply({embeds: [embed], ephemeral:true});
            return;
        }   
        //попытка дату сменить
        try {
            activity.changeDate(rDate);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            modalInt.reply({embeds: [embed], ephemeral:true});
            return;
        }

        if (reason){
            const embed = interaction.client.genEmbed(`Сбор ${activity} был успешно перенесён!\nПричина: ${reason}`, 'Успех!');
            modalInt.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`Сбор ${activity} был успешно перенесён!`, 'Успех!');
            modalInt.reply({embeds: [embed]});
        }  

        const row = activity.createActionRow();
        interaction.message.edit({components: [row]}); 
        
        const logMess = await modalInt.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(async err => {
                console.log('Ошибка удаления лога переноса сбора: ' + err.message)
                if (interaction.guildId){
                    const sett = interaction.client.settings.get(interaction.guildId);
                    sett.sendLog(`Ошибка удаления лога переноса сбора: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }, 86400000); 
    }
}