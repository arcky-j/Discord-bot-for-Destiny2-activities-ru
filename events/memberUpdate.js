const {Events} = require('discord.js');
 //срабатывает, если пользователь на сервере изменился
module.exports = {
    name: Events.GuildMemberUpdate,
    
    execute(oldMember, newMember) {
        //пока этот ивент нужен только для обработки кэша
    },
};