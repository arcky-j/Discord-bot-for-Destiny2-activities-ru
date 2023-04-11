const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const setDate = require('../utility/date_set.js');
const getRandomColor = require('../utility/get_random_color.js');
const GenBase = require('../entities/genBase.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('генератор_сборов')
        .setDescription('Команда для создания сообщения с мастером сборов')
            .addStringOption(option => 
                option.setName('вид_сбора')
                    .setDescription('Какие мастера создания сборов будет иметь сообщение')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Рейды', value: 'raids'},
                        {name: 'Подземелья', value: 'dungs'},
                        {name: 'Другое', value: 'custom'},
                        {name: 'Рейды, Подземелья, Другое', value: 'all'},
                        {name: 'Подземелья, Другое', value: 'dungs_custom'},                                            
                        {name: 'Рейды, Подземелья', value: 'raids_dungs'},                                            
                    ))
            .addStringOption(option =>
                option.setName('описание')
                    .setDescription('Дополнительная информация в сообщении'))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        //получение данных из команды
        const typ = interaction.options.getString('вид_сбора');
        const descript = interaction.options.getString('описание');

        const id = interaction.client.generateId(interaction.client.actGens);
        //const message = await interaction.channel.send('*Строительные работы*');

        switch (typ){
            case 'raids': 
                break;
            case 'dungs':
                break;
            case 'custom':
                break;
            case 'all':
                break;
            case 'dungs_custom':
                break;
            case 'raids_dungs':
                break;
        }

        

        interaction.reply({content: 'Данная команда недоступна в вашем регионе'});
    }
}