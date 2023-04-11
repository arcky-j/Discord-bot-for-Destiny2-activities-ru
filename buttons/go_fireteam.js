//код для кнопки записи в боевую группу
module.exports = {
    name: 'go_fireteam',
    async execute(interaction){    
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.customId);
        if (!fireteam){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        //попытка записи Стража
        try{
            fireteam.add(user);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }     
        interaction.update({embeds: fireteam.message.embeds});

    }
}