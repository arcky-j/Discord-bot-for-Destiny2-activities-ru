//код для кнопки отмены записи в боевую группу
module.exports = {
    name: 'cancel_activity',
    async execute(interaction){
        const user = interaction.member;
        //поиск нужной боевой группы
        const activity = interaction.client.activities.get(interaction.message.customId);
        if (!activity){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        //попытка удаления Стража
        try {
            activity.remove(user.id);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //обновление сообщения сбора
        interaction.update({embeds: activity.message.embeds});

    }
}