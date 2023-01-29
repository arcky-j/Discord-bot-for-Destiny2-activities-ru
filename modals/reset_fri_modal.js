//код для всплывающего окна с пятничным ресетом
module.exports = {
    name: 'reset_fri_modal',
    async execute(interaction){
        //получает значения из всплывающего окна
        const xur = interaction.fields.getTextInputValue('reset_xur');
        const trials = interaction.fields.getTextInputValue('reset_trials');
        //загружает информацию в объект, отвечающий за ресет
        interaction.client.reset.uploadFri(xur, trials);

        interaction.reply({content: 'Вы успешно загрузили информацию о пятничном ресете!'});
    }
}