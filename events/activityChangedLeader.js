const {ActivityEvents, Guardian, GuardianEvents} = require('../fireteams_module');

module.exports = {
    name: ActivityEvents.ChangedLeader,
    async execute(activity, newLeader, oldLeader) {
        if (!activity.clan.guardians.cache.has(newLeader.id)){
            const guardian = new Guardian(activity.newLeader, activity.clan);
            activity.clan.guardians.set(guardian);
            activity.client.emit(GuardianEvents.Registered, guardian);
        }
    },
};