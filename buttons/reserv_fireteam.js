//код для кнопки записи в резерв
module.exports = {
    name: 'reserv_fireteam',
    async execute(interaction){
        const embed = interaction.message.embeds[0];
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(interaction.message.id);

        if (!fireteam){
            await interaction.reply({content: `Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        //попытка записи в резервы
        try {
            fireteam.reservAdd(user.id, user);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //обновление сообщения сбора
        embed.fields[1].value = fireteam.getMembersString();
        embed.fields[2].value = fireteam.getReservsString();
        fireteam.setEmbed(embed);
        await interaction.update({embeds: [embed]});
    }
}