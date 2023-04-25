const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');
//команда для отображения настроек
module.exports = {
    data: new SlashCommandBuilder()
        .setName('настройки')
        .setDescription('Команда для отображения настроек')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        //interaction.client.cacheManager.saveSetting();
        const settings = interaction.client.settings.get(interaction.guild.id);
        const embed = new EmbedBuilder()
            .setTitle(`Конфигурация бота для сервера ${interaction.guild.name}`)
            .setDescription(`${settings.getString()}`)
            .setThumbnail(interaction.guild.iconURL())
            .setColor(interaction.user.accentColor)
            .setTimestamp(new Date());
                  
        interaction.reply({embeds: [embed]});
    }
}