//код обработчика для кнопки записи через броню
module.exports = {
    async execute(interaction, activity, user){
        //попытка перевести стража из брони в боевую группу
        try {
            activity.bronToMember(user);
            interaction.deferUpdate();
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
    }
}