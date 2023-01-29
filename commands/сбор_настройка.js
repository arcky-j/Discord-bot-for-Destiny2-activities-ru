//команда для создания любого сбора

const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const FireTeam = require('../entities/fireteam.js');
const setDate = require('../utility/date_set.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('сбор_настройка')
        .setDescription('Начинает сбор в указанную вами активность. Для сбора рейда или подземелья есть другие')
        .addStringOption(option => 
            option.setName('название')
                .setDescription('В какую активность вы хотите собрать людей? Пишите правильнее - это будет в заголовке сбора!')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('количество')
                .setDescription('Сколько Стражей должно быть в боевой группе? Допустимы значения от 3 до 12')
                .setRequired(true)
                .setMaxValue(12)
                .setMinValue(3))
        .addStringOption(option => 
            option.setName('время')
                .setDescription('Время начала вашей активности по мск в формате "ЧЧ:ММ"')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('дата')
                .setDescription('Дата вашей активности в формате "ДД.ММ". Форматы "ДД.ММ.ГГ" и "ДД.ММ.ГГГГ" поддерживаются')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('требования')
                .setDescription('Ваши требования к участникам (необязательно)'))
        .addStringOption(option =>
            option.setName('описание')
                .setDescription('Ваше дополнительные заметки (необязательно)')),

    async execute(interaction) {
        //получает данные из команды
        const actName = interaction.options.getString('название');
        const quant = interaction.options.getInteger('количество');
        const time = interaction.options.getString('время');
        const date = interaction.options.getString('дата');
        const requiries = interaction.options.getString('требования');     
        const descript = interaction.options.getString('описание');     

        //устанавливает дату через специальный метод
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
        let hT = h, mT = m, dayT = day, monT = mon;
        if (h<10) hT = `0${h}`;
        if (m<10) mT = `0${m}`;
        if (day<10) dayT = `0${day}`;
        if (mon<10) monT = `0${mon}`;
        const year = rDate.getFullYear();

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
        
        let bannerUrl = 'https://i.ibb.co/fDV3yJM/year-one-moments-of-triumph.png', embColor = 0x444537, embDesc = ''; //стандартное оформление       

        (() => { //специальное оформление, если есть ключевые слова
            if (actName.toLowerCase().includes('источник')){
                bannerUrl = 'https://i.ibb.co/NWQtT50/wellspring.jpg';
                embColor = 0x60c957;
                return;
            } else if (actName.toLowerCase().includes('железное знамя') ){
                bannerUrl = 'https://i.ibb.co/5G5w8ML/iron-banner.jpg';
                embColor = 0x9e6b31;
                return;
            } else if (actName.toLowerCase().includes('горнило') ){
                bannerUrl = 'https://i.ibb.co/2tGwSwn/crucible.jpg';
                embColor = 0xd93030;
                return;
            } else if (actName.toLowerCase().includes('гамбит') ){
                bannerUrl = 'https://i.ibb.co/Q9gkvL8/gambit.jpg';
                embColor = 0x32850f;
                return;
            } else if (actName.toLowerCase().includes('щит сераф') ){
                bannerUrl = 'https://i.ibb.co/GPPWJyS/seraph-shield.png';
                embColor = 0x36abbf;
                return;
            } else if (actName.toLowerCase().includes('налет') || actName.toLowerCase().includes('налёт')){
                bannerUrl = 'https://i.ibb.co/NmbVX7x/vanguard.png';
                embColor = 0x38468f;
                return;
            } else if (actName.toLowerCase().includes('осирис')){
                bannerUrl = 'https://i.ibb.co/9vn67RV/trials-of-osiris.jpg';
                embColor = 0xdec943;
                return;
            }
        })();

        //добавление тэгов ролей, если они есть

        let strTags = '';
        if (interaction.client.rolesActTag){
            interaction.client.rolesActTag.forEach((val, id) => {
                strTags += `<@&${id}> `;
            });
        }
        //добавление требований и описания, если есть

        if (requiries){
            if (quant < 5){
                embDesc += `Сбор ${actName}! Нужно ${quant} Стража.\nТребования к участникам: ${requiries}`;
            } else {
                embDesc += `Сбор ${actName}! Нужно ${quant} Стражей.\nТребования к участникам: ${requiries}`;
            }
        } else {
            if (quant < 5){
                embDesc += `Сбор ${actName}! Нужно ${quant} Стража.\nТребования к участникам отсутствуют!`;
            } else {
                embDesc += `Сбор ${actName}! Нужно ${quant} Стражей.\nТребования к участникам отсутствуют!`;
            }
        }
        if (descript){
            embDesc += `\n${descript}`;
        } 
        //формирование embed

        const embed = new EmbedBuilder()
        .setColor(embColor)
        .setTitle(`${actName}`)
        .setDescription(embDesc)
        .addFields(
            {name: 'Время и дата:', value: `**${hT}:${mT}** МСК  **${dayT}.${monT}.${year}**`},
            {name: 'Боевая группа:', value: `<@${interaction.user.id}> - ${interaction.user.tag} - *Лидер*`, inline: true},
            {name: 'Резерв:', value: 'Резерв пуст', inline: true}
        )
        .setThumbnail(bannerUrl);
        //отправка сообщения
        await interaction.channel.send({content: strTags, embeds: [embed], components: [row]});
        //формирование внутренней структуры данных
        const lastMess = interaction.channel.lastMessage;              
        interaction.client.fireteams.set(lastMess.id, new FireTeam(lastMess.id, interaction.user, actName, rDate, 'other', quant));
        interaction.client.timer.actMessages.set(lastMess.id, lastMess);
        //добавление ID 
        embed.setFooter({text: `ID: ${lastMess.id}`});
        lastMess.edit({embeds: [embed]});
        interaction.client.fireteams.get(lastMess.id).setEmbed(embed);
        //уведомление, если всё прошло успешно
        await interaction.reply({content: 'Ваш настраиваемый сбор успешно создан!', ephemeral:true});
    }
}