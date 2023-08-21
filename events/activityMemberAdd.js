const {ActivityEvents, Guardian, GuardianEvents} = require('../fireteams_module');

module.exports = {
    name: ActivityEvents.MemberAdd,
    async execute(activity, member) {
        if (!activity.clan.guardians.cache.has(member.id)){
            const guardian = new Guardian(member, activity.clan);
            activity.clan.guardians.set(guardian);
            activity.client.emit(GuardianEvents.Registered, guardian);
        }
    },
};