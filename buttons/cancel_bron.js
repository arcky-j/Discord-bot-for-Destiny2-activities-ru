//обработчик кнопки с отменой брони
module.exports = {
    name: 'cancel_bron',
    async execute(interaction){
        const user = interaction.user;
        const message = interaction.message;
        //вычурный, но рабочий способ получения id
        const id = message.embeds[0].footer.text;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (!fireteam || fireteam.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }

        try {
            //попытка удалить Стража из брони
            fireteam.bronDel(user.id);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }        
        //редактирование сообщения
        const embed = interaction.client.genEmbed(`Бронь удалена`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}