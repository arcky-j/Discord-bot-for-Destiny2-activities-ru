//код для обработки всплывающего окна с созданием своего embed-сообщения
const {EmbedBuilder} = require('discord.js');
const getRandomColor = require('../utility/get_random_color.js');
module.exports = {
    name: 'create_embed',
    async execute(interaction){
        //получает значения из всплывающего окна
        const embTitle = interaction.fields.getTextInputValue('embedTitle');
        const embDecs = interaction.fields.getTextInputValue('embedDesc');
        const embMedia = interaction.fields.getTextInputValue('embedMedia');
        const embBanner = interaction.fields.getTextInputValue('embedBanner');
        const embFooter = interaction.fields.getTextInputValue('embedFooter');

        const user = interaction.user;
        const color = getRandomColor();
        //формирует пользовательский embed
        const embed = new EmbedBuilder()
            .setDescription(embDecs)
            .setColor(color)
            .setThumbnail(user.displayAvatarURL()) //делает баннером аватар пользователя
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
            embed.setFooter(embFooter);
        }
        try{
            interaction.reply({embeds: [embed]});
        } catch (err){
            interaction.reply({content: `Ошибка! ${err.message}`, ephemeral: true});
        }
    }
}
