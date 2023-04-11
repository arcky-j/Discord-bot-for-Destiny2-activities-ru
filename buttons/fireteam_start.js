module.exports = {
    name: 'fireteam_start',
    async execute(interaction){    
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.customId);
        if (!fireteam || fireteam.state == 'Закрыт'){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        if (fireteam.leaderId != user.id){ //проверка на лидерство
            await interaction.reply({content:'Только лидер может начать активность! Что довольно логично', ephemeral: true});
            return;
        }
        //попытка передачи лидерства
        try{
            fireteam.start();
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
         
        interaction.update({embeds: fireteam.message.embeds});

    }
}