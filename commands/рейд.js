//команда для создания сбора в рейд

const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const FireTeam = require('../entities/fireteam.js');
const setDate = require('../utility/date_set.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('рейд')
        .setDescription('Начинает сбор в рейд')
        .addStringOption(option => 
            option.setName('название')
                .setDescription('В какой рейд вы хотите собрать людей?')
                .setRequired(true)
                .addChoices(
                    {name: 'Гибель Короля', value: 'Гибель Короля'},
                    {name: 'Клятва Послушника', value: 'Клятва Послушника'},
                    {name: 'Хрустальный Чертог', value: 'Хрустальный Чертог'},
                    {name: 'Склеп Глубокого Камня', value: 'Склеп Глубокого Камня'},
                    {name: 'Сад Спасения', value: 'Сад Спасения'},
                    {name: 'Последнее Желание', value: 'Последнее Желание'}                                              
                ))
        .addStringOption(option => 
            option.setName('время')
                .setDescription('Время начала рейда по мск в формате "ЧЧ:ММ"')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('дата')
                .setDescription('Дата рейда в формате "ДД.ММ". Форматы "ДД.ММ.ГГ" и "ДД.ММ.ГГГГ" поддерживаются')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('требования')
                .setDescription('Ваши требования к участникам (необязательно)'))
        .addStringOption(option =>
            option.setName('описание')
                .setDescription('Ваше дополнительные заметки (необязательно)')),

    async execute(interaction) {
        //получение данных из команды
        const raidName = interaction.options.getString('название');
        const time = interaction.options.getString('время');
        const date = interaction.options.getString('дата');
        const requiries = interaction.options.getString('требования');     
        const descript = interaction.options.getString('описание');     
        
        let rDate;
        //установка даты через специальный метод
        try {
            rDate = setDate(time, date);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
        //установка читаемого формата даты
        const h = rDate.getHours();
        const m = rDate.getMinutes();

        const day = rDate.getDate();
        const mon = rDate.getMonth() + 1;
        const year = rDate.getFullYear();
        let hT = h, mT = m, dayT = day, monT = mon;
        if (h<10) hT = `0${h}`;
        if (m<10) mT = `0${m}`;
        if (day<10) dayT = `0${day}`;
        if (mon<10) monT = `0${mon}`;
        
        //добавление кнопок к сообщению

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('go_fireteam')
                    .setLabel('Я иду!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_fireteam')
                    .setLabel('Я передумал')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reserv_fireteam')
                    .setLabel('В резерв!')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('reserv_cancel_fireteam')
                    .setLabel('Покинуть резерв')
                    .setStyle(ButtonStyle.Secondary),                 
            );

        //оформление embed
        let bannerUrl, embColor, embDesc = '';
        switch (raidName){
            case 'Последнее Желание': bannerUrl = 'https://i.ibb.co/103DBb4/last-wish.jpg';
                embColor = 0x8675e6;
                break;
            case 'Сад Спасения': bannerUrl = 'https://i.ibb.co/dfgVs0Q/garden-of-salvation.png';
                embColor = 0x378a4d;
                break;
            case 'Склеп Глубокого Камня': bannerUrl = 'https://i.ibb.co/QnYXxRt/deep-stone-crypt.png';
                embColor = 0x4f9db3;
                break;
            case 'Клятва Послушника': bannerUrl = 'https://i.ibb.co/6mZTtq1/vow-of-the-disciple.jpg';
                embColor = 0x2d4527;
                break;
            case 'Хрустальный Чертог': bannerUrl = 'https://i.ibb.co/nw7ZjjC/vault-of-glass.jpg';
                embColor = 0x97c9c2;
                break;
            case 'Гибель Короля': bannerUrl = 'https://i.ibb.co/fHDQL1b/kings-fall.jpg';
                embColor = 0x83a362;
                break;
        }
        //добавление тэгов ролей, если такие есть
        let strTags = '';
        if (interaction.client.rolesActTag){
            interaction.client.rolesActTag.forEach((val, id) => {
                strTags += `<@&${id}> `;
            });
        }
        //добавление требований и описания, если есть
        if (requiries){
            embDesc += `Собираемся в рейд!\nТребования к участникам: ${requiries}`;
        } else {
            embDesc += `Собираемся в рейд!\nТребования к участникам отсутствуют!`;
        }
        if (descript){
            embDesc += `\n${descript}`;
        } 
        //формирование embed
        const embed = new EmbedBuilder()
        .setColor(embColor)
        .setTitle(`${raidName}`)
        .setDescription(embDesc)
        .addFields(
            {name: 'Время и дата:', value: `**${hT}:${mT}** МСК  **${dayT}.${monT}.${year}**`},
            {name: 'Боевая группа:', value: `<@${interaction.user.id}> - *Лидер*`, inline: true},
            {name: 'Резерв:', value: 'Резерв пуст', inline: true}
        )
        .setThumbnail(bannerUrl);
        //отправка сообщения
        await interaction.channel.send({content: strTags, embeds: [embed], components: [row]});
        //формирование внутренней структуры данных
        const lastMess = interaction.channel.lastMessage;
        interaction.client.fireteams.set(lastMess.id, new FireTeam(lastMess.id, interaction.user, raidName, rDate, 'raid'));
        interaction.client.timer.actMessages.set(lastMess.id, lastMess);
        //добавление ID 
        embed.setFooter({text: `ID: ${lastMess.id}`});
        lastMess.edit({embeds: [embed]});
        interaction.client.fireteams.get(lastMess.id).setEmbed(embed);
        //уведомление, если всё прошло успешно
        await interaction.reply({content: 'Ваш рейдсбор успешно создан!', ephemeral:true});
    }
}