const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder} = require('discord.js');
const {getRandomColor} = require('../fireteams_module');

//команда для отмены существующего сбора
module.exports = {
    data: new SlashCommandBuilder()
            .setName('создать_embed')
            .setDescription('Создаёт форму для создания embed-сообщения'),

    async execute (interaction){
        //создаёт форму для записи данных в embed-сообщение
        const modal = new ModalBuilder()
            .setCustomId('create_embed')
            .setTitle('Создание Embed-сообщения');
        
        const embedTitle = new TextInputBuilder()
            .setCustomId('embedTitle')
            .setLabel('Заголовок вашего сообщения')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const embedDesc = new TextInputBuilder()
            .setCustomId('embedDesc')
            .setLabel('Содержание вашего сообщения')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const embedMedia = new TextInputBuilder()
            .setCustomId('embedMedia')
            .setLabel('Ссылка на гифку или картинку, если хочется')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const embedBanner = new TextInputBuilder()
            .setCustomId('embedBanner')
            .setLabel('Баннер эмбеда. Тоже только URL')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        const embedFooter = new TextInputBuilder()
            .setCustomId('embedFooter')
            .setLabel('Футер эмбеда')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const actionRow0 = new ActionRowBuilder().addComponents(embedTitle);
        const actionRow1 = new ActionRowBuilder().addComponents(embedDesc);
        const actionRow2 = new ActionRowBuilder().addComponents(embedMedia);
        const actionRow3 = new ActionRowBuilder().addComponents(embedBanner);
        const actionRow4 = new ActionRowBuilder().addComponents(embedFooter);

        modal.addComponents(actionRow1, actionRow0, actionRow2, actionRow3, actionRow4);
        //отправляет форму пользователю
        await interaction.showModal(modal);
        const filter = inter => inter.user.id === interaction.user.id && inter.customId === 'create_embed';
        const modalInt = await interaction.awaitModalSubmit({filter, time: 600000})
        .catch(error => console.log(error));

        const embTitle = modalInt.fields.getTextInputValue('embedTitle');
        const embDecs = modalInt.fields.getTextInputValue('embedDesc');
        const embMedia = modalInt.fields.getTextInputValue('embedMedia');
        const embBanner = modalInt.fields.getTextInputValue('embedBanner');
        const embFooter = modalInt.fields.getTextInputValue('embedFooter');

        //const user = await interaction.client.users.fetch(interaction.user.id);

        //const color = user.accentColor;
        const color = getRandomColor();
        //формирует пользовательский embed
        const embed = new EmbedBuilder()
            .setDescription(embDecs)
            .setColor(color)
            //.setThumbnail(user.displayAvatarURL()) //делает баннером аватар пользователя
            .setTimestamp(new Date());
        if (embTitle){
            embed.setTitle(embTitle);
        }
        if (embMedia){
            embed.setImage(embMedia);
        }
        if (embBanner){
            embed.setThumbnail(embBanner);
        }
        if (embFooter){
            embed.setFooter({text: embFooter});
        }
        try{
            modalInt.reply({embeds: [embed]});
        } catch (err){
            modalInt.reply({content: `Ошибка! ${err.message}`, ephemeral: true});
        }
    }
};