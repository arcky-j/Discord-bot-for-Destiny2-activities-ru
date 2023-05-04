const MapVote = require('../entities/mapVote.js');

module.exports = {
    name: 'map_voteMenu',
    async execute(interaction){
        const message = interaction.message;
        const interId = message.embeds[0].footer.text;
        //проверка на лидерство
        if (interaction.member.id != interId){
            const embed = interaction.client.genEmbed(`Отказано в доступе!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        
        const id = interaction.client.generateId(interaction.client.mapVotes);
        const mapVote = new MapVote(id, interaction.members, message.maps);
        const embed = mapVote.createEmbed(interId);
        const row = mapVote.createActionRow();
        const mess = await interaction.channel.send({embeds: [embed], components: [row]});
        mess.customId = id;
        mapVote.message = mess;
        interaction.client.mapVotes.set(id, mapVote);
        const embedRep = interaction.client.genEmbed(`Голосование создано!`, 'Успех!');
        interaction.reply({embeds: [embedRep], ephemeral:true});
    }
}