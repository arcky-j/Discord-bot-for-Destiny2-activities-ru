const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    async execute(interaction, activity, user){
        const modal = ModalBuilder()
        .setCustomId(`reason_close_${activity.id}`)
        .setTitle('Передача лидерства');

        const reasonT = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Причина передачи лидерства')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Если хотите, укажите причину (отправить форму обязательно даже пустой)')
        .setRequired(false);

        const actionRow0 = new ActionRowBuilder().addComponents(reasonT);
        modal.addComponents(actionRow0);

        await interaction.showModal(modal);
        const filter = (interactionM) => interactionM.customId === `reason_${activity.id}`;
        const modalInt = await interaction.awaitModalSubmit({filter, time: 180000})
        .catch(err => {
            console.log(err.message);
            // const embed = interaction.client.genEmbed(`Форма для действия со сбором ${activity} не была отправлена\n${err.message}`, 'Ошибка!');
            // interaction.reply({embeds: [embed]});
        });
        const reason = modalInt.fields.getTextInputValue('reason');

        activity.sendAlerts('del');
        //удаление сообщения
        if (reason) {
            const embed = interaction.client.genEmbed(`Сбор в ${activity} успешно удалён!\nПричина: ${reason}`, 'Успех!');
            modalInt.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`Сбор в ${activity} успешно удалён!`, 'Успех!');
            modalInt.reply({embeds: [embed]});
        }  
        //запись уведомления в логи
        const logMess = await modalInt.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(async err => {
                console.log('Ошибка удаления сообщения лога удаления сбора (каво?): ' + err.message)
                if (interaction.guildId){
                    const sett = interaction.client.settings.get(interaction.guildId);
                    sett.sendLog(`Ошибка удаления сообщения лога удаления сбора (каво?): ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }, 86400000);
        activity.message.delete(); 
    }
}