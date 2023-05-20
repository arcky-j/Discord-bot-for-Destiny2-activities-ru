module.exports = async function(interaction){
    const id = interaction.customId.split('_')[2];
    const action = interaction.customId.split('_')[1];

    const user = interaction.member;

    const mapVote = interaction.client.mapVotes.get(id);

    if (action == 'start' || action == 'close'){

        if (user.id !== interaction.member.id){
            const embed = interaction.client.genEmbed(`Отказано в доступе!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }

        const button = require(`../buttons/mapVotes/${action}`);
        button.execute(interaction, mapVote, user);
    }

    if (!mapVote.users.has(user.id)){
        const embed = interaction.client.genEmbed(`Отказано в доступе!`, 'Ошибка!');
        interaction.reply({embeds: [embed], ephemeral:true});
        return;
    }
    try{
        const messComps = mapVote.vote(map, user.id);           
        interaction.update({embeds: [messComps[0]], components: [messComps[1]]});
        return;
    } catch (err){
        const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
        interaction.reply({embeds: [embed], ephemeral:true});
        return;
    }
}