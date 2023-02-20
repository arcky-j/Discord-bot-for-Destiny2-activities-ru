const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//временная команда для восстановления голосования после ресета бота; скоро будет удалена
module.exports = {
    data: new SlashCommandBuilder()
            .setName('реорганизация')
            .setDescription('Команда для голосований после отключения')
            .addSubcommand(subcommand =>
                subcommand.setName('голосование')
                    .setDescription('Восстановление голосования')
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('ID голосования для записи')
                            .setRequired(true))
                    .addUserOption(option =>
                        option.setName('пользователь')
                            .setDescription('Пользователь, которого вы хотите добавить. Начните вводить его ник и выберите из списка.')
                            .setRequired(true))
                    .addNumberOption(option =>
                        option.setName('вариант')
                            .setDescription('Номер варианта (0-4)')
                            .setMinValue(0)
                            .setMaxValue(4)
                            .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const id = interaction.options.getString('id');
        if (interaction.options.getSubcommand() === 'голосование'){
            const userNew = interaction.options.getUser('пользователь');
            const choice = interaction.options.getNumber('вариант');
            const poll = interaction.client.polls.get(id);
    
            if (!poll){
                await interaction.reply({content: 'Неверный ID', ephemeral:true});
                return;
            }
            try{
                poll.addVoter(userNew, choice);
            } catch (err){
                await interaction.reply({content: err.message, ephemeral:true});
                return;
            }
            const message = await interaction.channel.messages.fetch(id);
            const embed = message.embeds[0];
            embed.fields[1].value = poll.getVotersString1();
            embed.fields[0].value = poll.getVotersString0();
            if (embed.fields[2]){
                embed.fields[2].value = poll.getVotersString2();
            }
            if (embed.fields[3]){
                embed.fields[3].value = poll.getVotersString3();
            }
            if (embed.fields[4]){
                embed.fields[4].value = poll.getVotersString4();
            }       
            message.edit({embeds: [embed]});
            await interaction.reply({content: 'Да', ephemeral: true});
        }       
    }
};