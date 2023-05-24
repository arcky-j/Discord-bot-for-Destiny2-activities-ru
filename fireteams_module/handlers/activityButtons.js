module.exports = async function(interaction){
    const id = interaction.customId.split('_')[2];
    const action = interaction.customId.split('_')[1];
    const user = interaction.member;
    //поиск нужной боевой группы
    const activity = interaction.client.d2clans.getActivity(interaction.guildId, id);

    if (!activity || activity.state == 'Закрыт'){
        const embed = interaction.client.genEmbed(`Скорее всего, активность уже стартовала. Возможно, произошла непредвиденная ошибка`, 'Ошибка!');
        interaction.reply({embeds: [embed], ephemeral:true});
        return;
    }

    if (interaction.customId.match(/Lead/) && user.id != activity.leader.id){
        const embed = interaction.client.genEmbed(`Это действие доступно только лидеру сбора!`, 'Ошибка!');
        interaction.reply({embeds: [embed], ephemeral:true});
        return;
    }

    const button = require(`../buttons/activities/${action}`);
    
    if (button){
        button.execute(interaction, activity, user);
    } else {
        const embed = interaction.client.genEmbed(`Непредвиденное исключение. Код ошибки: BNF`, 'Ошибка!');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}