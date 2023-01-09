const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
//команда для закрытия существующего голосования
module.exports = {
    data: new SlashCommandBuilder()
            .setName('закрыть_голосование')
            .setDescription('Закрытие вашего голосования для подведения итогов')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID закрываемого голосования')
                    .setRequired(true)),

    async execute (interaction){
        const id = interaction.options.getString('id');
        const channel = interaction.channel;
        const user = interaction.user;
        const client = interaction.client;
        //поиск нужного голосования
        const poll = client.polls.get(id);

        if (!poll){
            await interaction.reply({content:'Неверный ID', ephemeral: true});
            return;                        
        }
        if (user.id != poll.creator.id){
            await interaction.reply({content:'Только создатель голосования может его закрыть!', ephemeral: true});
            return;  
        }
        //формирование итогов
        const message = await channel.messages.fetch(id);
        const oldEmbed = message.embeds[0];
        const embed = new EmbedBuilder()
        .setTitle(oldEmbed.title)
        .setDescription(`Голосование было закрыто ${user.tag}!`)
        .addFields(oldEmbed.fields)
        .setColor(oldEmbed.color)
        .setThumbnail(oldEmbed.thumbnail.url)
        .setFooter({text: 'Всем респект за участие!'});
        //удаление исходного сообщения и отправка итогов
        try {
            await channel.messages.delete(id);
            await channel.send({embeds: [embed]});
        } catch (err){
            await interaction.reply({content:err.message, ephemeral: true});
        }       
        //удаление данных
        client.polls.delete(id);
        interaction.reply({content:'Вы успешно закрыли голосование!', ephemeral: true})
    }
};