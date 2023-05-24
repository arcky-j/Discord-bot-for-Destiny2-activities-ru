const {ActivityEvents, Guardian} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.MemberAdd,
    async execute(fireteam, member) {
        const clan = fireteam.clan;
        if (clan.guardians.cache.has(member.id)){
            const guardian = clan.guardians.get(member.id);
            guardian.actCountInc();
            clan.guardians.save(guardian);
        } else {
            const guardian = new Guardian(member, 1);
            clan.guardians.set(guardian);
        }
    },
};