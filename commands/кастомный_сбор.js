const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const getRandomColor = require('../utility/get_random_color.js');
const CustomActivity = require('../entities/customActivity.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('кастомный_сбор')
        .setDescription('Команда для начала любого сбора (не используйте для боевых групп)')
        .addStringOption(option => 
            option.setName('заголовок')
                .setDescription('Тема сбора')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('время_дата')
                .setDescription('Время и дата. Просто строка, можно ввести приблизительные сроки')
                .setRequired(true))
        .addBooleanOption(option => 
            option.setName('тэги')
                .setDescription('Нужны ли общие тэги участников? По умолчанию: false')
                .setRequired(false))
        .addRoleOption(option => 
            option.setName('роль')
                .setDescription('Роль для выдачи записавшимся участникам')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('требования')
                .setDescription('Ваши требования к участникам (необязательно)'))
        .addStringOption(option =>
            option.setName('описание')
                .setDescription('Ваши дополнительные заметки (необязательно)'))
        .addStringOption(option =>
            option.setName('медиа')
                .setDescription('Ссылка на картинку или гифку для оформления (ТОЛЬКО URL!)'))
        .addStringOption(option =>
            option.setName('баннер')
                .setDescription('Ссылка на картинку или гифку для оформления баннера (ТОЛЬКО URL!)'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        //получение данных из команды
        let actName = interaction.options.getString('заголовок');
        const timeDate = interaction.options.getString('время_дата');
        const requiries = interaction.options.getString('требования');     
        const descript = interaction.options.getString('описание');          
        const tags = interaction.options.getBoolean('тэги');          
        const role = interaction.options.getRole('роль');          
        const media = interaction.options.getString('медиа');                 
        const banner = interaction.options.getString('баннер');                 
        
        //добавление тэгов ролей, если такие есть
        let strTags = '';
        if (tags){        
            const sett = interaction.client.settings.get(interaction.guild.id);
            if (sett.rolesToTag || sett.rolesToTag.size > 0){
                sett.rolesToTag.forEach((val) => {
                    strTags += `<@&${val.id}> `;
                });
            }
        }      
        //оформление embed
        let bannerUrl, embColor = getRandomColor(), embDesc = '';

        if(banner){
            bannerUrl = banner;
        } else {
            bannerUrl = 'https://i.ibb.co/fDV3yJM/year-one-moments-of-triumph.png';
        }

        if (requiries){
            embDesc += `Требования: ${requiries}\n`;
        } 
        if (descript){
            embDesc += `\n${descript}\n`;
            if (role){
                embDesc += `*При записи вы получите роль* ${role}`;
            }
        } 
            
        //формирование embed
        const id = interaction.client.generateId(interaction.client.activities);    
        //отправка сообщения
        const lastMess = await interaction.channel.send({content: '*Строительные работы*'});
        const activity = new CustomActivity(id, lastMess, actName, Infinity, interaction.member, timeDate, role.id);
        try {
            const embed = activity.createEmbed(embColor, embDesc, bannerUrl, media);
            const row = activity.createActionRow();
            const mess1 = await lastMess.edit({content: strTags, embeds: [embed], components: [row]});
            activity.message = mess1;
            setTimeout(() => {
                activity.refreshMessage();
            }, 150);     
        } catch (err){
            lastMess.delete();
            await interaction.reply({content: `Ошибка при создании сбора: ${err.message}`, ephemeral: true});
            return;
        }  
        //формирование внутренней структуры данных
        //const lastMess = interaction.channel.lastMessage;
        lastMess.customId = id;
        interaction.client.activities.set(id, activity);
        //уведомление, если всё прошло успешно
        await interaction.reply({content: 'Сбор создан', ephemeral: true});

    }
}