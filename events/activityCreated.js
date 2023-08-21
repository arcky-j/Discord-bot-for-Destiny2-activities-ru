const {ActivityEvents, Guardian, GuardianEvents} = require('../fireteams_module');

module.exports = {
    name: ActivityEvents.Created,
    async execute(activity) {
        if (!activity.clan.guardians.cache.has(activity.leader.id)){
            const guardian = new Guardian(activity.leader, activity.clan);
            activity.clan.guardians.set(guardian);
            activity.client.emit(GuardianEvents.Registered, guardian);
        }
    },
};