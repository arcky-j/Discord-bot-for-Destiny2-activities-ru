const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для выбора чата для отправки ресета
module.exports = {
    data: new SlashCommandBuilder()
            .setName('set_reset_channel')
            .setDescription('Установить чат для публикации ресетов')
            .addChannelOption(option =>
                option.setName('чат')
                    .setDescription('Канал, для публикации ресетов'))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const channel = interaction.options.getChannel('чат');
        interaction.client.reset.setChannel(channel);
        //если чат не введён, то он просто сбрасывается
        if (!channel){
            await interaction.reply({content: `Вы успешно сбросили канал для рассылки ресетов!`, ephemeral:true});
            return;
        }

        await interaction.reply({content: `Вы успешно установили канал ${channel.name} как канал для рассылки ресетов!`, ephemeral:true});
    }
};