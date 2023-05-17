const {UserSelectMenuBuilder, ActionRowBuilder, ComponentType} = require('discord.js');

module.exports = {
    async execute(interaction, activity, user){          
        const message = interaction.message;    
        if (message.components[3]){            
            const rows = activity.createSettingsRow();
            interaction.update({components: [message.components[0], rows[0], rows[1]]});
            return;
        }
        const userSelect = new UserSelectMenuBuilder()
        .setCustomId(`bronAddMenu_${activity.id}`)
        .setPlaceholder('Выберите пользователя для бронирования места');

        const rowSel = new ActionRowBuilder()
        .addComponents(userSelect);

        message.components.push(rowSel);
        message.edit({components: message.components});  

        interaction.deferUpdate();

        const colFilter = i => {
            return i.user.id === interaction.user.id && i.customId === `bronAddMenu_${activity.id}`;
        }

        const userSelectInteraction = await message.awaitMessageComponent({filter: colFilter, componentType: ComponentType.UserSelect, time: 60000})
        .catch(err => {
            console.log(err.message);          
        });

        if (!userSelectInteraction){
            message.components.pop();
            message.edit({components: message.components});  
            return;
        }

        const userSelected = userSelectInteraction.users.get(userSelectInteraction.values[0]);

        try {
            activity.bronAdd(userSelected);
            const embed = interaction.client.genEmbed(`Вы успешно забронировали место для ${userSelected}!`, 'Успех!');
            userSelectInteraction.reply({embeds: [embed], ephemeral:true}); 
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            userSelectInteraction.reply({embeds: [embed], ephemeral:true});
        }
        const row = activity.createActionRow();
        message.edit({components: [row]});
    }
}