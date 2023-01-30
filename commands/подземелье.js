//команда для создания сбора в подземелье

const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const FireTeam = require('../entities/fireteam.js');
const setDate = require('../utility/date_set.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('подземелье')
        .setDescription('Начинает сбор в подземелье')
        .addStringOption(option => 
            option.setName('название')
                .setDescription('В какое поземелье вы хотите собрать людей?')
                .setRequired(true)
                .addChoices(
                    {name: 'Расколотый Трон', value: 'Расколотый Трон'},
                    {name: 'Яма Ереси', value: 'Яма Ереси'},
                    {name: 'Откровение', value: 'Откровение'},
                    {name: 'Тиски Алчности', value: 'Тиски Алчности'},
                    {name: 'Дуальность', value: 'Дуальность'},
                    {name: 'Шпиль Хранителя', value: 'Шпиль Хранителя'}
                ))
        .addStringOption(option => 
            option.setName('время')
                .setDescription('Время начала похода в подземелье по мск в формате "ЧЧ:ММ"')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('дата')
                .setDescription('Дата похода в подземелье в формате "ДД.ММ". Форматы "ДД.ММ.ГГ" и "ДД.ММ.ГГГГ" поддерживаются')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('требования')
                .setDescription('Ваши требования к участникам (необязательно)'))
        .addStringOption(option =>
            option.setName('описание')
                .setDescription('Ваше дополнительные заметки (необязательно)')),

    async execute(interaction) {
        //получение данных из команды
        const dungName = interaction.options.getString('название');
        const time = interaction.options.getString('время');
        const date = interaction.options.getString('дата');
        const requiries = interaction.options.getString('требования');     
        const descript = interaction.options.getString('описание');     
        //установка даты
        let rDate;

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
        switch (dungName){
            case 'Расколотый Трон': bannerUrl = 'https://i.ibb.co/2MVCV65/shattered-throne.jpg';
                embColor = 0x626d70;
                break;
            case 'Яма Ереси': bannerUrl = 'https://i.ibb.co/yYxrmfV/pit-of-heresy.jpg';
                embColor = 0x7a2c2c;
                break;
            case 'Откровение': bannerUrl = 'https://i.ibb.co/DCZF3ss/prophecy.jpg';
                embColor = 0x9e59c9;
                break;
            case 'Тиски Алчности': bannerUrl = 'https://i.ibb.co/fQwpX8N/grasp-of-avarice.jpg';
                embColor = 0xc9c14b;
                break;
            case 'Дуальность': bannerUrl = 'https://i.ibb.co/BVpYCXS/duality.jpg';
                embColor = 0x8f2d17;
                break;
            case 'Шпиль Хранителя': bannerUrl = 'https://i.ibb.co/7WvDcvw/spire-of-the-watcher.jpg';
                embColor = 0xb3974d;
                break;
        }
        //добавление тэгов ролей, если такие есть
        let strTags = '';
        if (interaction.client.rolesActTag){
            interaction.client.rolesActTag.forEach((val, id) => {
                strTags += `<@&${id}> `;
            });
        }
        //добавление требования и описания, если есть
        if (requiries){
            embDesc += `Собираемся в подземелье!\nТребования к участникам: ${requiries}`;
        } else {
            embDesc += `Собираемся в подземелье!\nТребования к участникам отсутствуют!`;
        }
        if (descript){
            embDesc += `\n${descript}`;
        }
        //формирование embed
        const embed = new EmbedBuilder()
        .setColor(embColor)
        .setTitle(`${dungName}`)
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
        interaction.client.fireteams.set(lastMess.id, new FireTeam(lastMess.id, interaction.user, dungName, rDate, 'dungeon'));
        interaction.client.timer.actMessages.set(lastMess.id, lastMess);
        //добавление ID
        embed.setFooter({text: `ID: ${lastMess.id}`});
        lastMess.edit({embeds: [embed]});
        interaction.client.fireteams.get(lastMess.id).setEmbed(embed);
        //уведомление, если всё прошло успешно
        await interaction.reply({content: 'Ваш сбор в подземелье успешно создан!', ephemeral:true});
    }
}