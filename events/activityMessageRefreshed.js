const {ActivityEvents} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.MessageRefreshed,
    async execute(fireteam) {
        const clan = fireteam.clan;
        clan.activities.save(fireteam);
    },
};