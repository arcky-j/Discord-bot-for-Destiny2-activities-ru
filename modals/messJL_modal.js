//код для всплывающего окна с пятничным ресетом
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'messJL_modal',
    async execute(interaction){
        //получает значения из всплывающего окна
        const messJ = interaction.fields.getTextInputValue('messJ');
        const messA = interaction.fields.getTextInputValue('messA');
        const messL = interaction.fields.getTextInputValue('messL');
        //загружает информацию в объект, отвечающий за ресет
        const sett = interaction.client.settings.get(interaction.guild.id);
        sett.setJALMessages(messJ, messA, messL);

        const embed = new EmbedBuilder().setTitle('Текста уведомлений о прибытии, принятии правил и уходе обновлены').setDescription(`Уведомление о прибытии: ${messJ}\nУведомление о принятии правил: ${messA}\nУведомление о уходе: ${messL}`);
        await interaction.reply({embeds: [embed]});
    }
}