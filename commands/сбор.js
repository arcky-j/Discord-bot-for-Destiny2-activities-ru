const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const FireTeam = require('../entities/fireteam.js');
const setDate = require('../utility/date_set.js');
const getRandomColor = require('../utility/get_random_color');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('сбор')
        .setDescription('Команда для начала сбора')
        .addSubcommand(subcommand =>
            subcommand
            .setName('рейд')
            .setDescription('Начинает сбор в рейд')
            .addStringOption(option => 
                option.setName('название')
                    .setDescription('В какой рейд вы хотите собрать людей?')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Источник Кошмаров', value: 'Источник Кошмаров'},
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
                    .setDescription('Ваше дополнительные заметки (необязательно)'))
            .addStringOption(option =>
                option.setName('сложность')
                    .setDescription('Установка сложности рейда (по умолчанию обычная)')
                    .addChoices(
                        {name: 'Обычная', value: 'Обычная'},
                        {name: 'Мастер', value: 'Мастер'}
                    ))
            .addUserOption(option =>
                option.setName('бронь1')
                    .setDescription('Забронируйте место для Стража (всего 2 места для брони в рейд)'))
            .addUserOption(option =>
                option.setName('бронь2')
                    .setDescription('Забронируйте место для Стража (всего 2 места для брони в рейд)')))
        .addSubcommand(subcommand =>
            subcommand
            .setName('подземелье')
            .setDescription('Начинает сбор в подземелье')
            .addStringOption(option => 
                option.setName('название')
                    .setDescription('В какое поземелье вы хотите собрать людей?')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Шпиль Хранителя', value: 'Шпиль Хранителя'},
                        {name: 'Дуальность', value: 'Дуальность'},
                        {name: 'Тиски Алчности', value: 'Тиски Алчности'},
                        {name: 'Откровение', value: 'Откровение'},
                        {name: 'Яма Ереси', value: 'Яма Ереси'},
                        {name: 'Расколотый Трон', value: 'Расколотый Трон'}                       
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
                    .setDescription('Ваше дополнительные заметки (необязательно)'))
            .addStringOption(option =>
                option.setName('сложность')
                    .setDescription('Установка сложности подземелья (по умолчанию обычная)')
                    .addChoices(
                        {name: 'Обычная', value: 'Обычная'},
                        {name: 'Мастер', value: 'Мастер'}
                    ))
            .addUserOption(option =>
                option.setName('бронь1')
                    .setDescription('Забронируйте место для Стража (всего 1 место для брони в подземелье)')))
        .addSubcommand(subcommand =>
            subcommand
            .setName('другое')
            .setDescription('Начинает сбор в любую указанную вами активность. Не используйте для рейдов и подземелий')
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
                    .setDescription('Ваше дополнительные заметки (необязательно)'))),

    async execute(interaction) {
        //получение данных из команды
        const actName = interaction.options.getString('название');
        const quant = interaction.options.getInteger('количество');
        const time = interaction.options.getString('время');
        const date = interaction.options.getString('дата');
        const requiries = interaction.options.getString('требования');     
        const descript = interaction.options.getString('описание');  
        const difficulty = interaction.options.getString('сложность');
        const res1 = interaction.options.getUser('бронь1');   
        const res2 = interaction.options.getUser('бронь2');   
        
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
                    .setLabel('Я точно иду!')
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
        const rowdm = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('go_bron')
                    .setLabel('Да, запишите меня')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_bron')
                    .setLabel('Нет, я отказываюсь')
                    .setStyle(ButtonStyle.Danger),
        )
        //добавление тэгов ролей, если такие есть
        let strTags = '';
        const sett = interaction.client.settings.get(interaction.guild.id);
        if (sett.rolesToTag || sett.rolesToTag.size > 0){
            sett.rolesToTag.forEach((val) => {
                strTags += `<@&${val.id}> `;
            });
        }
        //оформление embed
        let bannerUrl, embColor, embDesc = '', actType = '';
        if (interaction.options.getSubcommand() === 'рейд'){
            actType = 'raid';
            switch (actName){
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
                case 'Источник Кошмаров': bannerUrl = 'https://i.ibb.co/7V0Lk4r/destiny-2-lightfall-raid-0.jpg';
                    embColor = 0xfff8f2;
                    break;
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
        }
        if (interaction.options.getSubcommand() === 'подземелье'){
            actType = 'dungeon';
            switch (actName){
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
            if (requiries){
                embDesc += `Собираемся в подземелье!\nТребования к участникам: ${requiries}`;
            } else {
                embDesc += `Собираемся в подземелье!\nТребования к участникам отсутствуют!`;
            }
            if (descript){
                embDesc += `\n${descript}`;
            }
        }
        if (interaction.options.getSubcommand() === 'другое'){
            bannerUrl = 'https://i.ibb.co/fDV3yJM/year-one-moments-of-triumph.png'; embColor = getRandomColor(); embDesc = ''; //стандартное оформление       
            actType = 'other';
            (() => { //специальное оформление, если есть ключевые слова
                if (actName.match(/источник/i)){
                    bannerUrl = 'https://i.ibb.co/NWQtT50/wellspring.jpg';
                    embColor = 0x60c957;
                    return;
                } else if (actName.match(/железное знамя/i) ){
                    bannerUrl = 'https://i.ibb.co/5G5w8ML/iron-banner.jpg';
                    embColor = 0x9e6b31;
                    return;
                } else if (actName.match(/горнило/i) ){
                    bannerUrl = 'https://i.ibb.co/2tGwSwn/crucible.jpg';
                    embColor = 0xd93030;
                    return;
                } else if (actName.match(/гамбит/i) ){
                    bannerUrl = 'https://i.ibb.co/Q9gkvL8/gambit.jpg';
                    embColor = 0x32850f;
                    return;
                }  else if (actName.match(/налет/i) || actName.match(/налёт/i) || actName.match(/сумра/i)){
                    bannerUrl = 'https://i.ibb.co/NmbVX7x/vanguard.png';
                    embColor = 0x38468f;
                    return;
                } else if (actName.match(/осирис/i)){
                    bannerUrl = 'https://i.ibb.co/9vn67RV/trials-of-osiris.jpg';
                    embColor = 0xdec943;
                    return;
                } else if (actName.match(/кампан/i) || actName.match(/100к мисси/i) || actName.match(/сплав/i)){
                    bannerUrl = 'https://i.ibb.co/HKVW2r4/lightfall-campaign.jpg';
                    embColor = 0x4fe0a4;
                    return;
                } else if (actName.match(/вечност/i)){
                    bannerUrl = 'https://i.ibb.co/vHFWq2D/Dares-of-Eternity-Xur.jpg';
                    embColor = 0x4f90e0;
                    return;
                } else if (actName.match(/экзот/i)){
                    bannerUrl = 'https://i.ibb.co/2PrkMBJ/destiny-2-exotic-engram.jpg';
                    embColor = 0xf0f573;
                    return;
                } else if (actName.match(/ГМ/) || actName.match(/грандмастер/i)){
                    bannerUrl = 'https://i.ibb.co/SKRg5pB/EYZZg-R1-Uc-AEX3-Np.jpg';
                    embColor = 0xf0f2ae;
                    return;
                }
            })();
            if (requiries){
                if (quant < 5){
                    embDesc += `Сбор! Нужно ${quant} Стража.\nТребования к участникам: ${requiries}`;
                } else {
                    embDesc += `Сбор! Нужно ${quant} Стражей.\nТребования к участникам: ${requiries}`;
                }
            } else {
                if (quant < 5){
                    embDesc += `Сбор! Нужно ${quant} Стража.\nТребования к участникам отсутствуют!`;
                } else {
                    embDesc += `Сбор! Нужно ${quant} Стражей.\nТребования к участникам отсутствуют!`;
                }
            }
            if (descript){
                embDesc += `\n${descript}`;
            }
        }    
        //формирование embed
        const id = interaction.client.generateId(interaction.client.fireteams);
        let embTitle = actName;
        if (difficulty == 'Мастер'){
            embTitle = `Мастер ${actName}`;
        }
        let embFireteam = `<@${interaction.user.id}>`;
        if(res1){
            if (res1.id == interaction.user.id || res1.bot){
                await interaction.reply({content: 'Недопустимая бронь 1!', ephemeral:true});
                return;
            }
            embFireteam += '\n#бронь';   
        }
        if(res2){
            if (res2.id == interaction.user.id || res2.bot){
                await interaction.reply({content: 'Недопустимая бронь 2!', ephemeral:true});
                return;
            }
            embFireteam += '\n#бронь';
        }
        const embed = new EmbedBuilder()
        .setColor(embColor)
        .setTitle(embTitle)
        .setDescription(embDesc)
        .addFields(
            {name: 'Время и дата', value: `**${hT}:${mT}** МСК  **${dayT}.${monT}.${year}**`, inline: true},
            {name: 'Лидер', value: `<@${interaction.user.id}>`, inline: true},
            {name: 'Боевая группа', value: embFireteam, inline: false},
            {name: 'Резерв', value: 'Резерв пуст', inline: false}
        )
        .setThumbnail(bannerUrl)
        .setFooter({text: `ID: ${id}`});
        //отправка сообщения
        await interaction.channel.send({content: strTags, embeds: [embed], components: [row]});
        
        //формирование внутренней структуры данных
        const lastMess = interaction.channel.lastMessage;
        lastMess.customId = id;
        interaction.client.fireteams.set(id, new FireTeam(id, lastMess, interaction.user, actName, rDate, actType, quant, rowdm, res1, res2));
        interaction.client.timer.actMessages.set(lastMess.id, lastMess);
        //уведомление, если всё прошло успешно
        await interaction.reply({content: 'Ваш сбор успешно создан!', ephemeral:true});
    }
}