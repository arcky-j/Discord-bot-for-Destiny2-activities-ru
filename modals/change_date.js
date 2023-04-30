const setDate = require('../utility/date_set.js');
const CustomActivity = require('../entities/customActivity');

module.exports = {
    name: 'change_date',
    async execute(interaction){
        const message = interaction.message;
        const activity = interaction.client.activities.get(message.customId);
        const reason = interaction.fields.getTextInputValue('reason');
        if (activity instanceof CustomActivity){
            const rDate = interaction.fields.getTextInputValue('date');
            try {
                activity.changeDate(rDate);
            } catch (err) {
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
        } else {
            const time = interaction.fields.getTextInputValue('time');
            const date = interaction.fields.getTextInputValue('date');
            let rDate;
            try {
                rDate = setDate(time, date);
            } catch (err) {
                const embed = interaction.client.genEmbed(`Не удалось установить дату: ${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }   
            //попытка дату сменить
            try {
                activity.changeDate(rDate);
            } catch (err) {
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
        }
        
        //рассылка уведомлений
        if (reason){
            const embed = interaction.client.genEmbed(`Сбор ${activity} был успешно перенесён!\nПричина: ${reason}`, 'Успех!');
            interaction.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`Сбор ${activity} был успешно перенесён!`, 'Успех!');
            interaction.reply({embeds: [embed]});
        }  
        const row = activity.createActionRow();
        interaction.message.edit({components: [row]}); 
        
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(async err => {
                console.log('Ошибка удаления лога переноса сбора: ' + err.message)
                if (interaction.guildId){
                    const sett = interaction.client.settings.get(interaction.guildId);
                    sett.sendLog(`Ошибка удаления лога переноса сбора: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }, 86400000);  
    }
}          
            