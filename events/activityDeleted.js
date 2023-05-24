const {ActivityEvents} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.Deleted,
    async execute(fireteam) {
        const clan = fireteam.clan;
        if (fireteam.state !== fireteam.states[0]){
            const guardian = clan.guardians.get(fireteam.leader.id);
            guardian.leadCountDec();
            if (fireteam.members.size > 1)
            for (const guard of fireteam.members){
                const g = clan.guardians.get(guard[0]);
                g.actCountDec();
            }
        }       
        clan.activities.delete(fireteam);
    },
};