const {EmbedBuilder} = require('discord.js');

module.exports = function genEmbed(desc, title, color, thumbnail, footer, fieldTitle, fieldDesc){
    const embed = new EmbedBuilder()
    .setDescription(desc)
    .setTitle(title)
    .setTimestamp(new Date());
    if (color){
        embed.setColor(color);
    } else if (title.match(/логов/i)) {
            if (title.match(/ошибк/i)){
                embed.setColor(0xf38181);
            } else if (title.match(/уведомлени/i)){
                embed.setColor(0xdee685);
            } else if(title.match(/успех/i)) {
                embed.setColor(0x77e686);
            } else {
                embed.setColor(0x3eedf0);
            }
        } else if (title.match(/уведомлени/i)){
            embed.setColor(0xf0e24a);
        } else if (title.match(/успех/i)){
            embed.setColor(0x3ddb48);
        } else if (title.match(/ошибк/i)){
            embed.setColor(0xd12626);
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
//для логов ошибки/уведы/успех/прочее: f38181/dee685/77e686/0x3eedf0 
//зелёный для уведомлений, но добрее: 3ddb48