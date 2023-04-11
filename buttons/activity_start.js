module.exports = {
    name: 'activity_start',
    async execute(interaction){    
        const user = interaction.user;
        //поиск нужной боевой группы
        const activity = interaction.client.activities.get(interaction.message.customId);
        if (!activity || activity.state == 'Закрыт'){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        if (activity.leaderId != user.id){ //проверка на лидерство
            await interaction.reply({content:'Только лидер может начать активность! Что довольно логично', ephemeral: true});
            return;
        }
        //попытка передачи лидерства
        try{
            activity.start();
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
         
        interaction.update({embeds: activity.message.embeds});

    }
}