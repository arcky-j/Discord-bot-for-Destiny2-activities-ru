//код для кнопки записи в резерв
module.exports = {
    name: 'reserv_fireteam',
    async execute(interaction){
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.customId);

        if (!fireteam){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        //попытка записи в резервы
        try {
            fireteam.moveReserv(user);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //обновление сообщения сбора
        interaction.update({embeds: fireteam.message.embeds});

    }
}