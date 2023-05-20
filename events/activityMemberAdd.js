const {ActivityEvents} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.MemberAdd,
    async execute(fireteam, member) {
        
    },
};