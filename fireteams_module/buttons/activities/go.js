//код для кнопки записи в боевую группу
module.exports = {
    async execute(interaction, activity, user){    
        //попытка записи Стража
        try {
            const embed = activity.addUpdate(user);
            interaction.update({embeds: [embed]});
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}