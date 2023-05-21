const {ActivityEvents} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.Deleted,
    async execute(fireteam) {
        const clan = fireteam.client.d2clans.get(fireteam.guildId);
        if (fireteam.state !== fireteam.states[0]){
            const guardian = clan.guardians.get(fireteam.leader.id);
            guardian.leadCountDec();
            for (const guard of fireteam.members){
                guard.actCountDec();
            }
        }       
        clan.activities.delete(fireteam);
    },
};