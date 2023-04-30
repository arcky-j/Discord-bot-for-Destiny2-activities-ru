const {UserSelectMenuBuilder, ActionRowBuilder, ComponentType} = require('discord.js');

module.exports = {
    name: 'change_leader',
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
        if (message.components[1].components[0].type == ComponentType.UserSelect){            
            const rows = activity.createSettingsRow();
            interaction.update({components: [message.components[0], rows[0], rows[1]]});
            return;
        }
        const userSelect = new UserSelectMenuBuilder()
        .setCustomId('change_leaderMenu')
        .setPlaceholder('Выберите нового лидера сбора');

        const row = new ActionRowBuilder()
        .addComponents(userSelect);

        message.components.pop();
        message.components.push(row);

        interaction.update({components: message.components});  
    }
}