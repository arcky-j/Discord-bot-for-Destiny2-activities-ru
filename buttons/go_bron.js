//код обработчика для кнопки записи через броню
module.exports = {
    name: 'go_bron',
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

        //попытка перевести стража из брони в боевую группу
        try {
            await fireteam.bronToMember(user);
            const embed = interaction.client.genEmbed(`Бронь подтверждена`, 'Успех!');
            interaction.reply({embeds: [embed], ephemeral:true});
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
      
    }
}