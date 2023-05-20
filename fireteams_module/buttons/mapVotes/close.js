module.exports = {
    name: 'map_vote_close',
    async execute(interaction, mapVote, user){    
        mapVote.delete();
        const embed = interaction.client.genEmbed(`Активность удалена`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}