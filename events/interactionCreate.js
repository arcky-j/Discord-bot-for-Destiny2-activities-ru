const {Events, ReactionUserManager} = require('discord.js');
const Settings = require('../utility/settings.js');
//здесь обрабатываются все взаимодействия с пользователем
module.exports = {
    name: Events.InteractionCreate,
    async execute (interaction) {
        //создаёт объект настроек для сервера, если такого нет
        if (!interaction.client.settings.has(interaction.guild.id)){
            interaction.client.settings.set(interaction.guild.id, new Settings(interaction.guild.id));
        }
        //действия при срабатывании слэш-команды
        if (interaction.isChatInputCommand()){
            //получает объект команды из коллекции клиента
            const command = interaction.client.commands.get(interaction.commandName);
            //если такой не находит, оповещает консоль и выходит из метода
            if (!command) {
                console.error(`No command handler matching ${interaction.commandName} was found`);
                return;
            }

            try{
                await command.execute(interaction); //пробует выполнить метод execute
                
            } catch (error){ //и оповещает пользователя, если что-то пошло не так
                console.error(error);
                await interaction.reply({content: 'Произошла ошибка при исполнении команды', ephemeral: true});
            }
            //по этому принципу работают обработки и других интеракций
        }
        //действия при срабатывании кнопки
        if (interaction.isButton()) {

            const button = interaction.client.buttons.get(interaction.customId);

            if (!button) {
                console.error(`No button handler matching ${interaction.customId} was found`);
                return;
            }

            try{
                await button.execute(interaction);
            } catch (error){
                console.log(error);
                await interaction.reply({content: 'Произошла ошибка при нажатии кнопки :(', ephemeral: true});
            }
        }
        //действия при срабатывании команды контекстного меню
        if (interaction.isUserContextMenuCommand()) {
            
            const contextCommand = interaction.client.contextCommands.get(interaction.commandName);
            if (!contextCommand) {
                console.error(`No context command handler matching ${interaction.commandName} was found`);
                return;
            }

            try{
                await contextCommand.execute(interaction);
            } catch (error){
                console.log(error);
                await interaction.reply({content: 'Произошла ошибка при использовании контекстной комманды :(', ephemeral: true});
            }
        }
        //действия при отправке формы
        if (interaction.isModalSubmit()){
            const modal = interaction.client.modals.get(interaction.customId);
            if (!modal) {
                console.error(`No modal handler matching ${interaction.customId} was found`);
                return;
            }

            try{
                await modal.execute(interaction);
            } catch (error){
                console.log(error);
                await interaction.reply({content: 'Произошла ошибка при отправке формы :(', ephemeral: true});
            }
        }
    } 
}