const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    name: 'change_leaderMenu',
    async execute(interaction){
        const message = interaction.message;
        const user = interaction.users.get(interaction.values[0]);
        const activity = interaction.client.activities.get(message.customId);
        if (activity.leader.id != interaction.user.id){
            const embed = interaction.client.genEmbed(`Настраивать сбор может только лидер`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }      
        try {
            activity.changeLeader(user);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }

        const modal = new ModalBuilder()
        .setCustomId('reason')
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
        const filter = (interactionM) => interactionM.customId === 'reason';
        const modalInt = await interaction.awaitModalSubmit({filter, time: 180000});
        const reason = modalInt.fields.getTextInputValue('reason');

        if (reason){
            const embed = interaction.client.genEmbed(`В сборе ${activity} сменился Лидер! ${interaction.user} => ${user}\nПричина: ${reason}`, 'Уведомление');
            modalInt.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`В сборе ${activity} сменился Лидер! ${interaction.user} => ${user}`, 'Уведомление');
            modalInt.reply({embeds: [embed]});
        } 
        const row = activity.createActionRow();
        message.edit({components: [row]});  
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