module.exports = {
    name: 'cancel_bron',
    async execute(interaction){
        const user = interaction.user;
        const message = interaction.message;
        const id = message.content.substring(message.content.lastIndexOf(' ') + 1);
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (!fireteam){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }

        try {
            fireteam.bronDel(user.id);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        interaction.message.delete();
        await interaction.reply({content: 'Вы успешно отклонили запись в сбор! Бронь снята.'});
    }
}