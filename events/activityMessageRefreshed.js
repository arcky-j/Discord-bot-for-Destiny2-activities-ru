const {ActivityEvents} = require('../fireteams_module');

module.exports = {
    name: ActivityEvents.MessageRefreshed,
    async execute(fireteam) {
        const clan = fireteam.clan;
        clan.activities.save(fireteam);
    },
};