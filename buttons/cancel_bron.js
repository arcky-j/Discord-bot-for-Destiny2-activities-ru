//обработчик кнопки с отменой брони
module.exports = {
    name: 'cancel_bron',
    async execute(interaction){
        const user = interaction.user;
        const message = interaction.message;
        //вычурный, но рабочий способ получения id
        const id = message.content.substring(message.content.lastIndexOf(' ') + 1);
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (!fireteam){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }

        try {
            //попытка удалить Стража из брони
            fireteam.bronDel(user.id);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //редактирование сообщения
        await interaction.update({content: 'Вы успешно отклонили запись в сбор! Бронь снята.', components: []});
    }
}