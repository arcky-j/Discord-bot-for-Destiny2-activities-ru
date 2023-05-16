//код для кнопки отмены записи в боевую группу
module.exports = {
    async execute(interaction, activity, user){
        //попытка удаления Стража
        try {
            const embed = activity.removeUpdate(user.id);
            interaction.update({embeds: [embed]});
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}