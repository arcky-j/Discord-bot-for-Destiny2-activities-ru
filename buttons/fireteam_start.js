module.exports = {
    name: 'fireteam_start',
    async execute(interaction){    
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.customId);
        if (!fireteam || fireteam.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (fireteam.leader.id!= user.id){ //проверка на лидерство
            const embed = interaction.client.genEmbed(`Только лидер может начать активность!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //попытка передачи лидерства
        try{
            fireteam.start();
        } catch (err){
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
         
        interaction.update({embeds: fireteam.message.embeds});

    }
}