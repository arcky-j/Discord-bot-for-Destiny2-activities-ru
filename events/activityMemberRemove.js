const {ActivityEvents, Guardian} = require('../fireteams_module');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: ActivityEvents.MemberRemove,
    async execute(fireteam, member) {
        const clan = fireteam.client.d2clans.get(fireteam.guildId);
        if (clan.guardians.cache.has(member.id)){
            const guardian = clan.guardians.get(member.id);
            guardian.actCountDec();
            clan.guardians.save(guardian);
        } 
    },
};