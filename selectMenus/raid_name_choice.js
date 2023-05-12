

module.exports = {
    name: 'raid_name_choice',
    async execute(interaction){
        const name = interaction.values[0].split('_')[0];
        const id = interaction.values[0].split('_')[1];
        
        const embedRep = interaction.client.genEmbed(`Проверка ${name} ${id}`, 'Успех!');
        interaction.reply({embeds: [embedRep], ephemeral:true});
    }
}