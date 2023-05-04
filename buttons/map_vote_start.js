module.exports = {
    name: 'map_vote_start',
    async execute(interaction){    
        const user = interaction.member;
        const message = interaction.message;
        const interId = message.embeds[0].footer.text;

        const mapVote = interaction.client.mapVotes.get(message.customId);
       
        if (user.id != interId){
            const embed = interaction.client.genEmbed(`Отказано в доступе!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }

        mapVote.start();
        const embed = interaction.client.genEmbed(`Старт активности состоялся`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}