module.exports = {
    name: 'bron_deleteMenu',
    async execute(interaction){
        const message = interaction.message;
        const user = interaction.users.get(interaction.values[0]);
        const fireteam = interaction.client.activities.get(message.customId);

        if (!fireteam){
            const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //проверка на лидерство
        if (interaction.user.id != fireteam.leader.id){
            const embed = interaction.client.genEmbed(`Только лидер может управлять бронью сбора!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        try {
            fireteam.bronDel(user.id);
            const embed = interaction.client.genEmbed(`Вы успешно отозвали бронь для ${user}!`, 'Успех!');
            interaction.reply({embeds: [embed], ephemeral:true});
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
        }
        const row = fireteam.createActionRow();
        message.edit({components: [row]}); 
    }
}