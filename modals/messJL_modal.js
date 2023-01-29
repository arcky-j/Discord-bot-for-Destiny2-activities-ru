//код для всплывающего окна с пятничным ресетом
module.exports = {
    name: 'messJL_modal',
    async execute(interaction){
        //получает значения из всплывающего окна
        const messJ = interaction.fields.getTextInputValue('messJ');
        const messL = interaction.fields.getTextInputValue('messL');
        //загружает информацию в объект, отвечающий за ресет
        const sett = interaction.client.settings.get(interaction.guild.id);
        sett.setJLMessages(messJ, messL);

        interaction.reply({content: 'Вы успешно обновили уведомления о прибытии и уходе членов сервера!'});
    }
}