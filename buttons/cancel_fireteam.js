//код для кнопки отмены записи в боевую группу
module.exports = {
    name: 'cancel_fireteam',
    async execute(interaction){
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.customId);
        if (!fireteam){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        //попытка удаления Стража
        try {
            fireteam.remove(user.id);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //обновление сообщения сбора
        interaction.update({embeds: fireteam.message.embeds});

    }
}