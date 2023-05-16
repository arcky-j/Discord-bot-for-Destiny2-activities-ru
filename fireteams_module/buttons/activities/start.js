module.exports = {
    async execute(interaction, activity, user){    
        //попытка старта активности
        try{
            await activity.start();
            const embed = interaction.client.genEmbed(`Активность успешно начата. Сбор закрыт`, 'Успех!');
            interaction.reply({embeds: [embed], ephemeral:true});
        } catch(err){
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}