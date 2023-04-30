const {UserSelectMenuBuilder, ActionRowBuilder, ComponentType} = require('discord.js');

module.exports = {
    name: 'bron_delete',
    async execute(interaction){          
        const message = interaction.message;    
        const fireteam = interaction.client.activities.get(message.customId);
        if (!fireteam || fireteam.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (fireteam.leader.id != interaction.user.id){
            const embed = interaction.client.genEmbed(`Настраивать сбор может только лидер`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (message.components[3]){            
            const rows = fireteam.createSettingsRow();
            interaction.update({components: [message.components[0], rows[0], rows[1]]});
            return;
        }
        const userSelect = new UserSelectMenuBuilder()
        .setCustomId('bron_deleteMenu')
        .setPlaceholder('Выберите бронь, которую хотите удалить');

        const row = new ActionRowBuilder()
        .addComponents(userSelect);

        message.components.push(row);

        interaction.update({components: message.components});      
    }
}