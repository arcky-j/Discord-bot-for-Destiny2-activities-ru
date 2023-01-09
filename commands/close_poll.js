const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
//команда для закрытия существующего голосования
module.exports = {
    data: new SlashCommandBuilder()
            .setName('close_poll')
            .setDescription('Закрытие любого существующего голосования')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID закрываемого голосования')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина силового закрытия голосования')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const id = interaction.options.getString('id');
        const reason = interaction.options.getString('причина');
        const channel = interaction.channel;
        const user = interaction.user;
        const client = interaction.client;
        //поиск нужного голосования
        const poll = client.polls.get(id);

        if (!poll){
            await interaction.reply({content:'Неверный ID', ephemeral: true});
            return;                        
        }
        //формирование итогов
        const message = await channel.messages.fetch(id);
        const oldEmbed = message.embeds[0];
        const embed = new EmbedBuilder()
        .setTitle(oldEmbed.title)
        .setDescription(`Голосование было закрыто администратором ${user.tag}!\nПричина: ${reason}`)
        .addFields(oldEmbed.fields)
        .setColor(oldEmbed.color)
        .setThumbnail(oldEmbed.thumbnail.url)
        .setFooter({text: `Автор голосования: ${poll.creator.tag}`});
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