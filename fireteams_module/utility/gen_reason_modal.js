const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');

module.exports = function genReasonModal(title, label, id){
    const modal = new ModalBuilder()
        .setCustomId(`reason_${id}`)
        .setTitle(title);

        const reason = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel(label)
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Если хотите, укажите причину (отправить форму обязательно даже пустой)')
        .setRequired(false);
    const actionRow0 = new ActionRowBuilder().addComponents(reason);
    modal.addComponents(actionRow0);
    return modal;
}