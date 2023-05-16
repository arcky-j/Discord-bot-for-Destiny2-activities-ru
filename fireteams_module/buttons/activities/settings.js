module.exports = {
    async execute(interaction, activity, user){ 
        const message = interaction.message;        
        if (message.components.length > 1){
            do{
                message.components.pop();
            } while (message.components.length != 1)
            interaction.update({components: message.components});
            return;
        } 

        const row2 = activity.createSettingsRow();
        if (Array.isArray(row2)){
            message.components.push(row2[0], row2[1]);  
        } else {
            message.components.push(row2);  
        }
            
        interaction.update({components: message.components})
    }
}