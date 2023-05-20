module.exports = {
    name: 'map_vote_start',
    async execute(interaction, mapVote, user){    
       
        mapVote.start();
        const embed = interaction.client.genEmbed(`Старт активности состоялся`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}