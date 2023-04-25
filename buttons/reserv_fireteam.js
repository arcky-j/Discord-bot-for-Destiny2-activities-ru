//код для кнопки записи в резерв
module.exports = {
    name: 'reserv_fireteam',
    async execute(interaction){
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.customId);

        if (!fireteam || fireteam.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //попытка записи в резервы
        try {
            fireteam.moveReserv(user);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }        
        //обновление сообщения сбора
        interaction.update({embeds: fireteam.message.embeds});

    }
}