module.exports = {
    name: 'settings',
    async execute(interaction){          
        const message = interaction.message;     
        const activity = interaction.client.activities.get(message.customId);
        if (!activity){
            const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (activity.leader.id != interaction.user.id){
            const embed = interaction.client.genEmbed(`Настраивать сбор может только лидер`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        
        if (message.components.length > 1){
            do{
                message.components.pop();
            } while (message.components.length != 1)
            interaction.update({components: message.components});
            return;
        } 

        const row2 = activity.createSettingsRow();
        if (Array.isArray(row2)){
            message.components.push(row2[0], row2[1]);  
        } else {
            message.components.push(row2);  
        }
            
        interaction.update({components: message.components})
    }
}