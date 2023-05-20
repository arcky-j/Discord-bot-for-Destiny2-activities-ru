//обработчик кнопки с отменой брони
module.exports = {
    async execute(interaction, activity, user){
        //попытка удалить Стража из брони
        try {
            activity.bronDel(user.id);
            interaction.deferUpdate();
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }        
    }
}