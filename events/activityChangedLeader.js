const {ActivityEvents, Guardian} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.ChangedLeader,
    async execute(fireteam, newLeader, oldLeader) {
        const clan = fireteam.clan;
        if (clan.guardians.cache.has(newLeader.id)){
            const guardian = clan.guardians.get(newLeader.id);
            guardian.leadCountInc();
            if (fireteam.members.lastKey() == newLeader.id){
                guardian.actCountInc();
            }
            clan.guardians.save(guardian);
        } else {
            const guardian = new Guardian(member, 0, 1);
            clan.guardians.set(guardian);
        }

        const guardian = clan.guardians.get(oldLeader.id);
        guardian.leadCountDec();
        if (fireteam.members.has(oldLeader.id)){
            guardian.actCountInc();
        }
        clan.guardians.save(guardian);
    },
};