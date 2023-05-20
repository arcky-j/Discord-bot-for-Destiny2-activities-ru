const {UserSelectMenuBuilder, ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

module.exports = {
    async execute(interaction, activity, user){          
        const message = interaction.message;                
        if (message.components[2].components[0].type == ComponentType.UserSelect || message.components[1].components[0].type == ComponentType.UserSelect){            
            const rows = activity.createSettingsRow();
            if (Array.isArray(rows)){
                interaction.update({components: [message.components[0], rows[0], rows[1]]});  
            } else {
                interaction.update({components: [message.components[0], rows]}); 
            }           
            return;
        }

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId(`changeLeaderMenu_${activity.id}`)
        .setPlaceholder('Выберите нового лидера сбора');
        
        const rowSel = new ActionRowBuilder()
        .addComponents(userSelect);
        message.components.pop();
        message.components.push(rowSel);

        message.edit({components: message.components});  
        interaction.deferUpdate();

        const colFilter = i => {
            return i.user.id === interaction.user.id && i.customId === `changeLeaderMenu_${activity.id}`;
        }

        const userSelectInteraction = await message.awaitMessageComponent({filter: colFilter, componentType: ComponentType.UserSelect, time: 60000})
        .catch(err => {
            console.log(err.message);         
        });

        if (!userSelectInteraction){
            const rows = activity.createSettingsRow();
            if (Array.isArray(rows)){
                message.edit({components: [message.components[0], rows[0], rows[1]]});  
            } else {
                message.edit({components: [message.components[0], rows]}); 
            }    
            return;
        }

        const userSelected = userSelectInteraction.members.at(0);       

        const modal = new ModalBuilder()
        .setCustomId(`reason_CL_${activity.id}`)
        .setTitle('Передача лидерства');

        const reasonT = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Причина передачи лидерства')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Если хотите, укажите причину (отправить форму обязательно даже пустой)')
        .setRequired(false);

        const actionRow0 = new ActionRowBuilder().addComponents(reasonT);
        modal.addComponents(actionRow0);

        await userSelectInteraction.showModal(modal);
        const filter = (interactionM) => interactionM.customId === `reason_CL_${activity.id}`;
        const modalInt = await userSelectInteraction.awaitModalSubmit({filter, time: 180000})
        .catch(error => console.log(error));
        const reason = modalInt.fields.getTextInputValue('reason');

        try {
            activity.changeLeader(userSelected);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            modalInt.reply({embeds: [embed], ephemeral:true});
            return;
        }

        if (reason){
            const embed = interaction.client.genEmbed(`В сборе ${activity} сменился Лидер! ${user} => ${userSelected}\nПричина: ${reason}`, 'Уведомление');
            modalInt.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`В сборе ${activity} сменился Лидер! ${user} => ${userSelected}`, 'Уведомление');
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