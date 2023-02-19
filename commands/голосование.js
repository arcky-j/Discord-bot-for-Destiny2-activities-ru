const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const Poll = require('../entities/poll.js');
const getRandomColor = require('../utility/get_random_color');
//команда для начала голосования
module.exports = {
    data: new SlashCommandBuilder()
        .setName('голосование')
        .setDescription('Начинает голосование. Поддерживает до 5 вариантов')
        .addStringOption(option => 
            option.setName('тема')
                .setDescription('Предмет и заголовок голосования')
                .setRequired(true))       
        .addStringOption(option => 
            option.setName('вариант1')
                .setDescription('Первый вариант')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('вариант2')
                .setDescription('Второй вариант')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('вариант3')
                .setDescription('Третий вариант'))
        .addStringOption(option => 
            option.setName('вариант4')
                .setDescription('Четвёртый вариант'))
        .addStringOption(option => 
            option.setName('вариант5')
                .setDescription('Пятый вариант'))
        .addBooleanOption(option =>
            option.setName('смена_голоса')
                .setDescription('Можно ли будет участникам изменить выбор? по умолчанию: true'))
        .addBooleanOption(option =>
            option.setName('анонимность')
                .setDescription('Будет ли голосование анонимным? по умолчанию: false')),

    async execute(interaction) {
        //получение данных из команды
        const theme = interaction.options.getString('тема');
        let isChangeble = interaction.options.getBoolean('смена_голоса');
        let isAnon = interaction.options.getBoolean('анонимность');
        const choice1 = interaction.options.getString('вариант1');
        const choice2 = interaction.options.getString('вариант2');
        const choice3 = interaction.options.getString('вариант3');
        const choice4 = interaction.options.getString('вариант4');
        const choice5 = interaction.options.getString('вариант5');
        if (!isAnon){ //значение анонимности по умолчанию
            isAnon = false;
        }
        if (isChangeble == undefined){ //значение смены голоса по умолчанию
            isChangeble = true;
        }
        let count = 2;
        //два варианта необходимо ввести, но можно добавить ещё до трёх
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('select_choice0')
                    .setLabel(choice1)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('select_choice1')
                    .setLabel(choice2)
                    .setStyle(ButtonStyle.Primary),                
            );
        if (choice3){
            row.addComponents(
                new ButtonBuilder()
                .setCustomId('select_choice2')
                .setLabel(choice3)
                .setStyle(ButtonStyle.Primary),
            );
            count++;
        }
        if (choice4){
            row.addComponents(
                new ButtonBuilder()
                .setCustomId('select_choice3')
                .setLabel(choice4)
                .setStyle(ButtonStyle.Primary),
            );
            count++;
        }
        if (choice5){
            row.addComponents(
                new ButtonBuilder()
                .setCustomId('select_choice4')
                .setLabel(choice5)
                .setStyle(ButtonStyle.Primary),
            );
            count++;
        }
        //оформление описания голосования
        const embColor = getRandomColor(), bannerUrl = 'https://i.ibb.co/pdRdLHT/image.png';
        let embDesc = `Голосование начато!`;

        if (isChangeble){
            embDesc += `\nСвой выбор можно изменить.`;
        } else {
            embDesc += `\nСвой выбор нельзя изменить.`;
        }
        if (isAnon){
            embDesc += `\nГолосование анонимно.`;
        } else {
            embDesc += `\nГолосование открыто.`;
        }
        //формирование эмбэда
        const embed = new EmbedBuilder()
        .setColor(embColor)
        .setTitle(theme)
        .setDescription(embDesc)
        .addFields(
            {name: choice1, value: `Никого`, inline: true},
            {name: choice2, value: 'Никого', inline: true}
        )
        .setThumbnail(bannerUrl);
        if (choice3){
            embed.addFields({name: choice3, value: `Никого`, inline: true});
        }
        if (choice4){
            embed.addFields({name: choice4, value: `Никого`, inline: true});
        }
        if (choice5){
            embed.addFields({name: choice5, value: `Никого`, inline: true});
        }
        //отправка сообщения
        await interaction.channel.send({embeds: [embed], components: [row]});
        //формирование внутренней структуры данных
        const lastMess = interaction.channel.lastMessage;
        interaction.client.polls.set(lastMess.id, new Poll(lastMess.id, theme, interaction.user, isChangeble, isAnon, count));
        embed.setFooter({text: `Автор голосования: ${interaction.user.tag}\nID: ${lastMess.id}`});
        lastMess.edit({embeds: [embed]});
        await interaction.reply({content: 'Ваше голосование успешно создано!', ephemeral:true});
    }
}