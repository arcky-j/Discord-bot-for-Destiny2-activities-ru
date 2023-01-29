//код для всплывающего окна с ресетом
module.exports = {
    name: 'reset_modal',
    async execute(interaction){
        //получает значения из всплывающего окна
        const info = interaction.fields.getTextInputValue('reset_info');
        const nf = interaction.fields.getTextInputValue('reset_nf');
        const bonus = interaction.fields.getTextInputValue('reset_bonus');
        const raid = interaction.fields.getTextInputValue('reset_raid');
        const dung = interaction.fields.getTextInputValue('reset_dung');
        //загружает информацию в объект, отвечающий за ресет
        interaction.client.reset.upload(info, nf, bonus, raid, dung);

        interaction.reply({content: 'Вы успешно загрузили информацию о ресете!'});
    }
}