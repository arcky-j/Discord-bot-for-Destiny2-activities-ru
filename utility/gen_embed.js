const {EmbedBuilder} = require('discord.js');

module.exports = function genEmbed(desc, title, color, thumbnail, footer, fieldTitle, fieldDesc){
    const embed = new EmbedBuilder()
    .setDescription(desc)
    .setTitle(title)
    .setTimestamp(new Date());
    if (color){
        embed.setColor(color);
    } else if (title.match(/ошибк/i)) {
            embed.setColor(0xd12626);
        } else if (title.match(/уведомлени/i)){
            embed.setColor(0xf0e24a);
        } else if (title.match(/успех/i)){
            embed.setColor(0x4dd12a);
        }
           
    if (thumbnail){
        embed.setThumbnail(thumbnail);
    }

    if (footer){
        embed.setFooter({text: footer});
    }

    if (fieldTitle && fieldDesc){
        embed.addFields({name: fieldTitle, value: fieldDesc});
    }

    return embed;
}
//красный цвет для ошибок: 0xd12626
//жёлтый для уведомлений: 0xf0e24a
//голубой для логов: 0x3eedf0 надеюсь, я их когда-нибудь сделаю
//зелёный для уведомлений, но добрее: 0x4dd12a