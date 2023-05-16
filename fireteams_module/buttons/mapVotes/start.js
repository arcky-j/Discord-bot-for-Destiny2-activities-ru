module.exports = {
    name: 'map_vote_start',
    async execute(interaction, mapVote, user){    
       
        if (user.id != interaction.id){
            const embed = interaction.client.genEmbed(`Отказано в доступе!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }

        mapVote.start();
        const embed = interaction.client.genEmbed(`Старт активности состоялся`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}