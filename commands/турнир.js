const {UserSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('турнир')
        .setDescription('Команда для управления турнирами')
            .addSubcommand(subcommand =>
                subcommand
            .setName('голосование_карты')
            .setDescription('Создаёт генератор голосований двух пользователей за карту')
            .addStringOption(option => 
                option.setName('карты')
                    .setDescription('Перечислите карты через запятую')
                    .setRequired(true)))
                    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        //получение данных из команды      
        if (interaction.options.getSubcommand() === 'голосование_карты'){
            const maps = interaction.options.getString('карты');
            const mapsSplit = maps.split(', ');

            let mapString = '';
            mapsSplit.forEach(element => {
                mapString += `${element}\n`
            });

            const userSelect = new UserSelectMenuBuilder()
            .setCustomId('map_voteMenu')
            .setPlaceholder('Выберите 2 пользователя')
            .setMinValues(2)
            .setMaxValues(2);

            const row = new ActionRowBuilder()
            .addComponents(userSelect);

            const embed = new EmbedBuilder()
            .setTitle('Мастер голосований')
            .setDescription('Помогает создавать турнирные голосования за карты')
            .setAuthor({name: interaction.member.nickname})
            .setColor(interaction.member.displayColor)
            .setFields({name: 'Пул карт:', value: mapString})
            .setFooter({text: interaction.member.id});

            const message = await interaction.channel.send({embeds: [embed], components: [row]});
            message.maps = mapsSplit;
            //уведомление, если всё прошло успешно
            const embed1 = interaction.client.genEmbed(`Голосование "${maps}" создано`, 'Успех!');
            interaction.reply({embeds: [embed1], ephemeral:true});
        }
             
    }
}