//код обработчика для кнопки записи через броню
module.exports = {
    name: 'go_bron',
    async execute(interaction){
        const user = interaction.user;
        const message = interaction.message;
        //вычурный, но рабочий способ получения id
        const id = message.content.substring(message.content.lastIndexOf(' ')+1);
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (!fireteam || fireteam.state == 'Закрыт'){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }

        try {
            //попытка перевести стража из брони в боевую группу
            fireteam.bronToMember(user);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //обновление сообщения
        await interaction.reply({content: 'Бронь подтверждена', ephemeral: true});
    }
}