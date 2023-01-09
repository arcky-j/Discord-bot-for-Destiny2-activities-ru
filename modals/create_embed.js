//код для обработки всплывающего окна с созданием своего embed-сообщения
const {EmbedBuilder} = require('discord.js');
const getRandomColor = require('../utility/get_random_color.js');
module.exports = {
    name: 'create_embed',
    async execute(interaction){
        //получает значения из всплывающего окна
        const embTitle = interaction.fields.getTextInputValue('embedTitle');
        const embDecs = interaction.fields.getTextInputValue('embedDesc');

        const user = interaction.user;
        const channel = interaction.channel;
        const color = getRandomColor();
        //формирует пользовательский embed
        const embed = new EmbedBuilder()
            .setTitle(embTitle)
            .setDescription(embDecs)
            .setColor(color)
            .setThumbnail(user.displayAvatarURL()) //делает баннером аватар пользователя
            .setFooter({text: `Автор сообщения: ${user.tag}\nКоманда: /создать_embed`});
        
        interaction.reply({embeds: [embed]});
    }
}
