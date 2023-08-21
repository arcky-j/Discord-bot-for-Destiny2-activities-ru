const {Events} = require('discord.js');
const {activityButtonsHandle} = require('../fireteams_module');
//здесь обрабатываются все взаимодействия с пользователем
module.exports = {
    name: Events.InteractionCreate,
    async execute (interaction) {
        //действия при срабатывании слэш-команды
        if (interaction.isChatInputCommand()){
            //получает объект команды из коллекции клиента
            const command = interaction.client.commands.get(interaction.commandName);
            //если такой не находит, оповещает консоль и выходит из метода
            if (!command) {
                console.error(`No command handler matching ${interaction.commandName} was found`);
                return;
            }

            command.execute(interaction).catch(error => {
                console.error(error);
                const embed = interaction.client.genEmbed(`Произошла ошибка при исполнении команды: ${error.message}`, 'Ошибка!');
                if (!interaction.replied){
                    interaction.reply({embeds: [embed], ephemeral:true});
                }
            }); //пробует выполнить метод execute
                
            //по этому принципу работают обработки и других интеракций
        }
        //действия при срабатывании кнопки
        if (interaction.isButton()) {

            if (interaction.customId.match(/activity/)){
                activityButtonsHandle(interaction);
            }

        }
        //действия при срабатывании команды контекстного меню
        if (interaction.isUserContextMenuCommand()) {
            
            const contextCommand = interaction.client.contextCommands.get(interaction.commandName);
            if (!contextCommand) {
                console.error(`No context command handler matching ${interaction.commandName} was found`);
                return;
            }

            contextCommand.execute(interaction).catch(error => {
                console.log(error);
                const embed = interaction.client.genEmbed(`Произошла ошибка при использовании контекстной комманды: ${error.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
            });

        }
    } 
}