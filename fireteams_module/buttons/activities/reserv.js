//код для кнопки записи в резерв
module.exports = {
    async execute(interaction, activity, user){
        //попытка записи в резервы
        try {
            const embed = activity.moveReservUpdate(user);           
            interaction.update({embeds: [embed]});
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            await interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}