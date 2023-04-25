module.exports = {
    name: 'activity_start',
    async execute(interaction){    
        const user = interaction.user;
        //поиск нужной боевой группы
        const activity = interaction.client.activities.get(interaction.message.customId);
        if (!activity || activity.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (activity.leader.id != user.id){ //проверка на лидерство
            const embed = interaction.client.genEmbed(`Только лидер может начать активность!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //попытка передачи лидерства
        try{
            activity.start();
        } catch (err){
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
         
        interaction.update({embeds: activity.message.embeds});

    }
}