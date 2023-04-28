const {Events} = require('discord.js');

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
                interaction.reply({embeds: [embed], ephemeral:true});
            }); //пробует выполнить метод execute
                
            //по этому принципу работают обработки и других интеракций
        }
        //действия при срабатывании кнопки
        if (interaction.isButton()) {

            const button = interaction.client.buttons.get(interaction.customId);

            if (!button) {
                console.error(`No button handler matching ${interaction.customId} was found`);
                return;
            }
            button.execute(interaction).catch(error => {
                console.log(error);
                const embed = interaction.client.genEmbed(`Произошла ошибка при нажатии кнопки: ${error.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
            });
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
        //действия при отправке формы
        if (interaction.isModalSubmit()){
            const modal = interaction.client.modals.get(interaction.customId);
            if (!modal) {
                console.error(`No modal handler matching ${interaction.customId} was found`);
                return;
            }

            modal.execute(interaction).catch(error => {
                console.log(error);
                const embed = interaction.client.genEmbed(`Произошла ошибка при отправке формы: ${error.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
            });

        }
    } 
}