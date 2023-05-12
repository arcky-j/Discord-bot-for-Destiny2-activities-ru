const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const setDate = require('../utility/date_set.js');
const getRandomColor = require('../utility/get_random_color.js');
const GenBase = require('../entities/genBase.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('генератор_сборов')
        .setDescription('Команда для создания сообщения с мастером сборов')
            .addBooleanOption(option => 
                option.setName('рейды')
                    .setDescription('Будет ли сообщение содержать мастер сбора рейдов?')
                    .setRequired(true))
            .addBooleanOption(option => 
                option.setName('подземелья')
                    .setDescription('Будет ли сообщение содержать мастер сбора подземелий?')
                    .setRequired(true))
            .addBooleanOption(option => 
                option.setName('другое')
                    .setDescription('Будет ли сообщение содержать мастер общих сборов?')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('описание')
                    .setDescription('Дополнительная информация в сообщении'))
            .addStringOption(option =>
                option.setName('баннер')
                    .setDescription('Баннер эмбеда по желанию (ТОЛЬКО URL)'))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        //получение данных из команды
        const raids = interaction.options.getBoolean('рейды');
        const dungs = interaction.options.getBoolean('подземелье');
        const custom = interaction.options.getBoolean('другое');
        const descript = interaction.options.getString('описание');
        const banner = interaction.options.getString('баннер');

        //const id = interaction.client.generateId(interaction.client.actGens);
        //const message = await interaction.channel.send('*Строительные работы*');
        if (!raids && !dungs && !custom){
            const embed = interaction.client.genEmbed(`Вы не выбрали ни одной категории`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }

        const gen = new GenBase(raids, dungs, custom, descript);
        const embedGen = gen.createEmbed(banner);
        const rowGen = gen.createActionRow();

        const message = await interaction.channel.send({embeds: [embedGen], components: [rowGen]});
        gen.message = message;

        const embed = interaction.client.genEmbed(`Мастер сборов создан`, 'Успех!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}