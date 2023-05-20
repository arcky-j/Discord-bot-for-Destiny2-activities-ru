//код для кнопки отмены записи в боевую группу
module.exports = {
    async execute(interaction, activity, user){
        //попытка удаления Стража
        try {
            activity.remove(user.id);
            interaction.deferUpdate();
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}