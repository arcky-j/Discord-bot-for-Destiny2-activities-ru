const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('изменить')
            .setDescription('Управление профилем пользователя')
            .addSubcommand(subcommand =>
                subcommand.setName('ник')
                .setDescription('Ещё один способ изменить ник на сервере')
                    .addStringOption(option =>
                        option.setName('никнейм')
                            .setDescription('Никнейм, который вы хотите установить на этом сервере')
                            .setRequired(true))),

    async execute (interaction){
        const user = interaction.member;
        
        if (interaction.options.getSubcommand() === 'ник'){
            const newNick = interaction.options.getString('никнейм');
            user.setNickname(newNick)
            .then(() => {
                const embed = interaction.client.genEmbed(`Ник изменён!`, 'Успех!');
                interaction.reply({embeds: [embed], ephemeral:true});
            })
            .catch((err) => {
                const embed = interaction.client.genEmbed(`${err.message}\nЕсли выше написано 'Missing Permissions', то сменить ник придётся всё-таки вручную`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
            });                
        }
     
    }
};