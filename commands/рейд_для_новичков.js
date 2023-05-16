const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {dateSet, FireteamRes, FireteamUntimed} = require('../fireteams_module');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('рейд_для_новичков')
        .setDescription('Команда для начала сбора для новичков. Отличается только внешне')
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
                    .setDescription('Время рейда по мск в формате "ЧЧ:ММ". Не вводите для сбора по готовности.')
                    .setRequired(false))
            .addStringOption(option => 
                option.setName('дата')
                    .setDescription('Дата рейда в формате "ДД.ММ". Не вводите для сбора по готовности.')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('требования')
                    .setDescription('Ваши требования к участникам (необязательно)'))
            .addUserOption(option =>
                option.setName('бронь1')
                    .setDescription('Забронируйте место для Стража (всего 2 места для брони в рейд)'))
            .addUserOption(option =>
                option.setName('бронь2')
                    .setDescription('Забронируйте место для Стража (всего 2 места для брони в рейд)'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        //получение данных из команды
        const actName = interaction.options.getString('название');
        let quant = interaction.options.getInteger('количество');
        const time = interaction.options.getString('время');
        const date = interaction.options.getString('дата');
        const requiries = interaction.options.getString('требования');     
        const res1 = interaction.options.getUser('бронь1');   
        const res2 = interaction.options.getUser('бронь2');   
        //установка даты через специальный метод
        let rDate;
        try {
            if (time || date)
            rDate = dateSet(time, date);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }      
        
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
        actType = 'raid';
        quant = 6;
        switch (actName){
            case 'Последнее Желание': bannerUrl = 'https://i.ibb.co/103DBb4/last-wish.jpg';
                embColor = 0xe4ebea;
                break;
            case 'Сад Спасения': bannerUrl = 'https://i.ibb.co/dfgVs0Q/garden-of-salvation.png';
                embColor = 0xe2f0df;
                break;
            case 'Склеп Глубокого Камня': bannerUrl = 'https://i.ibb.co/QnYXxRt/deep-stone-crypt.png';
                embColor = 0xc3e9eb;
                break;
            case 'Клятва Послушника': bannerUrl = 'https://i.ibb.co/6mZTtq1/vow-of-the-disciple.jpg';
                embColor = 0xdaebcc;
                break;
            case 'Хрустальный Чертог': bannerUrl = 'https://i.ibb.co/nw7ZjjC/vault-of-glass.jpg';
                embColor = 0xcae2e3;
                break;
            case 'Гибель Короля': bannerUrl = 'https://i.ibb.co/fHDQL1b/kings-fall.jpg';
                embColor = 0xe0e0c5;
                break;
            case 'Источник Кошмаров': bannerUrl = 'https://i.ibb.co/7V0Lk4r/destiny-2-lightfall-raid-0.jpg';
                embColor = 0xf2f7f6;
                break;
        }
        //добавление требований и описания, если есть
        if (requiries){
            embDesc += `Обучаем начинающих рейдеров! Все механики объясним, покажем и научим делать.\nТребования: ${requiries}\n`;
        } else {
            embDesc += `Обучаем начинающих рейдеров! Все механики объясним, покажем и научим делать.\n`;
        }
        if (descript){
            embDesc += `\n${descript}\n`;
        }     
        actName = `Обучающий ${actName}`;
        //формирование embed
        const id = interaction.client.generateId(interaction.client.activities);      
        //отправка сообщения
        let fireteam;  
        if (time || date){
            fireteam = new FireteamRes(id, interaction.guildId, actName, quant, interaction.user, rDate, res1, res2);
        } else {
            fireteam = new FireteamUntimed(id, interaction.guildId, actName, quant, interaction.user, res1, res2);
        }
        const embed = fireteam.createEmbed(embColor, embDesc, bannerUrl);
        const row = fireteam.createActionRow();
        const mess1 = await interaction.channel.send({content: strTags, embeds: [embed], components: [row]});
        mess1.customId = id;
        fireteam.message = mess1;     
        //формирование внутренней структуры данных
        //const lastMess = interaction.channel.lastMessage;  
        interaction.client.activities.set(id, fireteam);
        fireteam.refreshMessage();
        //уведомление, если всё прошло успешно
        await interaction.reply({content: 'Сбор создан', ephemeral: true});

    }
}