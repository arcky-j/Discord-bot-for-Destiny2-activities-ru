//код для кнопки записи в боевую группу
module.exports = {
    async execute(interaction, activity, user){    
        //попытка записи Стража
        try {
            activity.add(user);
            interaction.deferUpdate();
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}