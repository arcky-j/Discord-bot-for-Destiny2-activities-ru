module.exports = {
    name: 'map_vote_close',
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
        
        mapVote.delete();
        const embed = interaction.client.genEmbed(`Активность удалена`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}