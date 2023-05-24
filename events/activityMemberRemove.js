const {ActivityEvents, Guardian} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.MemberRemove,
    async execute(fireteam, memberId) {
        const clan = fireteam.clan;
        if (clan.guardians.cache.has(memberId)){
            const guardian = clan.guardians.get(memberId);
            guardian.actCountDec();
            clan.guardians.save(guardian);
        } 
    },
};