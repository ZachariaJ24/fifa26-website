require("dotenv").config();
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

// Load credentials from environment variables
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = "1420630992757985333";
const REGISTERED_ROLE_ID = "1420812444649132116"; // verified role
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ELO System Configuration
const ELO_CONFIG = {
  prefix: '!',
  lobbyTimeout: 15 * 60 * 1000, // 15 minutes
  maxPlayers: 12,
  positions: ['C', 'LW', 'RW', 'D', 'G'],
  pointsPerWin: 3,
  pointsPerLoss: 0,
  pointsPerDraw: 1
};

// Role IDs from SCSFC configuration
const ROLES = {
  SIGNUP: "1420812476366459001",
  LEAGUE_BLOG: "1420812513557217290",
  CLUB_OWNER: "1420812555227762729",
  DIRECTOR: "1420812610915274902",
  MANAGER: "1420812643962323065",
  VERIFIED: "1420812444649132116"
  // No team roles for SCSFC
};

// Supabase setup
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Active ELO lobbies storage
const activeLobbies = new Map();

client.once("ready", async () => {
  console.log(`✅ SCSFC Enhanced Bot is online as ${client.user.tag}`);
  console.log(`🏒 Connected to guild: ${client.guilds.cache.get(GUILD_ID)?.name}`);
  client.user.setActivity("SCSFC Hockey League & ELO", { type: "WATCHING" });

  await syncAllUserRoles();
  setInterval(checkTwitchStreams, 5 * 60 * 1000);
});

// ==================== EXISTING AUTH FUNCTIONS ====================

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== GUILD_ID) return;

  try {
    const { data: discordUser } = await supabase
      .from("discord_users")
      .select("*")
      .eq("discord_id", member.id)
      .single();

    if (discordUser) {
      await member.roles.add(REGISTERED_ROLE_ID);
      console.log(`✅ Assigned registered role to ${member.user.tag}`);
      await syncUserRoles(member.id);
    }
  } catch (error) {
    console.error(`❌ Error handling member join for ${member.user.tag}:`, error);
  }
});

async function syncAllUserRoles() {
  try {
    console.log("🔄 Starting role synchronization...");

    const { data: discordUsers, error } = await supabase
      .from("discord_users")
      .select(`
        *,
        users(
          id,
          gamer_tag_id,
          players(
            role,
            team_id,
            teams:teams(name)
          ),
          user_roles(role)
        )
      `);

    if (error) {
      console.error("❌ Error fetching Discord users:", error);
      return;
    }

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error("❌ Guild not found");
      return;
    }

    const { data: teamRoles } = await supabase.from("discord_team_roles").select("*");
    const { data: managementRoles } = await supabase.from("discord_management_roles").select("*");

    let syncedCount = 0;

    for (const discordUser of discordUsers) {
      try {
        await syncUserRoles(discordUser.discord_id, discordUser.users, teamRoles, managementRoles);
        syncedCount++;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`❌ Error syncing roles for ${discordUser.discord_username}:`, error);
      }
    }

    console.log(`✅ Synced roles for ${syncedCount} users`);
  } catch (error) {
    console.error("❌ Error in role synchronization:", error);
  }
}

async function syncUserRoles(discordId, userData = null, teamRoles = null, managementRoles = null) {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    const member = await guild.members.fetch(discordId).catch(error => {
      if (error.code === 10007) {
        console.log(`⚠️ User ${discordId} is no longer in the server, skipping role sync`);
        return null;
      }
      throw error;
    });
    if (!member) return;

    if (!userData) {
      const { data: discordUser } = await supabase
        .from("discord_users")
        .select(`
          users(
            id,
            gamer_tag_id,
            players(
              role,
              team_id,
              teams:teams(name)
            ),
            user_roles(role)
          )
        `)
        .eq("discord_id", discordId)
        .single();

      userData = discordUser?.users;
    }

    if (!userData) return;

    if (!teamRoles) {
      const { data } = await supabase.from("discord_team_roles").select("*");
      teamRoles = data || [];
    }

    if (!managementRoles) {
      const { data } = await supabase.from("discord_management_roles").select("*");
      managementRoles = data || [];
    }

    const rolesToAdd = [];
    const rolesToRemove = [];

    // Add signup role for verified users
    if (REGISTERED_ROLE_ID && !member.roles.cache.has(REGISTERED_ROLE_ID)) {
      rolesToAdd.push(REGISTERED_ROLE_ID);
    }

    // Add team role if player is assigned to a team
    if (userData.players?.[0]?.team_id) {
      const teamRole = teamRoles.find((role) => role.team_id === userData.players[0].team_id);
      if (teamRole && !member.roles.cache.has(teamRole.discord_role_id)) {
        rolesToAdd.push(teamRole.discord_role_id);
      }
    }

    // Add management roles
    const playerRole = userData.players?.[0]?.role;
    if (playerRole && ["Owner", "GM", "AGM"].includes(playerRole)) {
      const managementRole = managementRoles.find((role) => role.role_type === playerRole);
      if (managementRole && !member.roles.cache.has(managementRole.discord_role_id)) {
        rolesToAdd.push(managementRole.discord_role_id);
      }
    }

    // Add admin role
    const hasAdminRole = userData.user_roles?.some((role) => role.role === "Admin");
    if (hasAdminRole) {
      const adminRole = managementRoles.find((role) => role.role_type === "Admin");
      if (adminRole && !member.roles.cache.has(adminRole.discord_role_id)) {
        rolesToAdd.push(adminRole.discord_role_id);
      }
    }

    const allMGHLRoles = [
      REGISTERED_ROLE_ID,
      ...teamRoles.map((r) => r.discord_role_id),
      ...managementRoles.map((r) => r.discord_role_id),
    ].filter(Boolean);

    for (const roleId of member.roles.cache.keys()) {
      if (allMGHLRoles.includes(roleId) && !rolesToAdd.includes(roleId) && roleId !== REGISTERED_ROLE_ID) {
        rolesToRemove.push(roleId);
      }
    }

    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd);
      console.log(`✅ Added roles to ${member.user.tag}: ${rolesToAdd.join(", ")}`);
    }

    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove);
      console.log(`🗑️ Removed roles from ${member.user.tag}: ${rolesToRemove.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Error syncing roles for user ${discordId}:`, error);
  }
}

// ==================== ELO SYSTEM FUNCTIONS ====================

// Check if ELO system is available
async function isEloSystemAvailable() {
  try {
    const { data, error } = await supabase
      .from('elo_players')
      .select('id')
      .limit(1);
    
    return !error; // If no error, ELO system is available
  } catch (error) {
    return false; // ELO system not available
  }
}

// ELO Player Registration
async function handleEloRegister(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  if (args.length < 1) {
    return message.reply('❌ Usage: `!register @username`');
  }

  const mentionedUser = message.mentions.users.first();
  if (!mentionedUser) {
    return message.reply('❌ Please mention a user with @username');
  }

  const discordId = mentionedUser.id;
  const discordUsername = mentionedUser.username;
  const displayName = args.slice(1).join(' ') || discordUsername;

  try {
    // Check if player already exists in ELO system
    const { data: existingPlayer } = await supabase
      .from('elo_players')
      .select('id')
      .eq('discord_id', discordId)
      .single();

    if (existingPlayer) {
      return message.reply('✅ Player is already registered for ELO matches! Use `!position` to set your position.');
    }

    // Insert new ELO player
    const { data: newPlayer, error } = await supabase
      .from('elo_players')
      .insert([{
        discord_id: discordId,
        discord_username: discordUsername,
        display_name: displayName,
        position: 'TBD',
        elo_rating: 1200
      }])
      .select()
      .single();

    if (error) throw error;

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎯 ELO Player Registered Successfully!')
      .setDescription(`**${displayName}** has been registered for ELO matches!`)
      .addFields(
        { name: 'Discord ID', value: discordId, inline: true },
        { name: 'Initial Rating', value: '1200', inline: true },
        { name: 'Next Step', value: 'Use `!position C/LW/RW/D/G` to set your position', inline: false }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('ELO Registration error:', error);
    await message.reply('❌ Failed to register player for ELO. Please try again.');
  }
}

// ELO Position Setting
async function handleEloPosition(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  if (args.length < 1) {
    return message.reply('❌ Usage: `!position C/LW/RW/D/G`');
  }

  const position = args[0].toUpperCase();
  if (!ELO_CONFIG.positions.includes(position)) {
    return message.reply(`❌ Invalid position. Choose from: ${ELO_CONFIG.positions.join(', ')}`);
  }

  try {
    const { data: player, error } = await supabase
      .from('elo_players')
      .update({ position: position })
      .eq('discord_id', message.author.id)
      .select()
      .single();

    if (error) throw error;

    if (!player) {
      return message.reply('❌ You must register first with `!register @username`');
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎯 ELO Position Updated!')
      .setDescription(`**${player.display_name}** is now set as **${position}**`)
      .addFields(
        { name: 'Position', value: position, inline: true },
        { name: 'Rating', value: player.elo_rating.toString(), inline: true },
        { name: 'Next Step', value: 'Use `!join` to enter a lobby', inline: false }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('ELO Position update error:', error);
    await message.reply('❌ Failed to update position. Please try again.');
  }
}

// ELO Lobby Management
async function handleEloJoin(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  try {
    // Check if player is registered and has position set
    const { data: player, error } = await supabase
      .from('elo_players')
      .select('*')
      .eq('discord_id', message.author.id)
      .single();

    if (error || !player) {
      return message.reply('❌ You must register first with `!register @username`');
    }

    if (player.position === 'TBD') {
      return message.reply('❌ You must set your position first with `!position C/LW/RW/D/G`');
    }

    // Find or create active lobby
    let lobby = null;
    for (const [lobbyId, lobbyData] of activeLobbies) {
      if (lobbyData.status === 'waiting' && lobbyData.players.size < ELO_CONFIG.maxPlayers) {
        lobby = lobbyData;
        break;
      }
    }

    if (!lobby) {
      // Create new lobby
      lobby = {
        id: Date.now().toString(),
        status: 'waiting',
        players: new Map(),
        captains: [],
        created: Date.now(),
        channel: message.channel
      };
      activeLobbies.set(lobby.id, lobby);
    }

    // Add player to lobby
    if (lobby.players.has(message.author.id)) {
      return message.reply('❌ You are already in this lobby!');
    }

    lobby.players.set(message.author.id, {
      id: message.author.id,
      name: player.display_name,
      position: player.position,
      rating: player.elo_rating
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎮 Joined ELO Lobby!')
      .setDescription(`**${player.display_name}** joined the lobby as **${player.position}**`)
      .addFields(
        { name: 'Players', value: `${lobby.players.size}/${ELO_CONFIG.maxPlayers}`, inline: true },
        { name: 'Status', value: lobby.status, inline: true },
        { name: 'Lobby ID', value: lobby.id, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Check if lobby is full
    if (lobby.players.size === ELO_CONFIG.maxPlayers) {
      await handleEloLobbyFull(lobby);
    }

  } catch (error) {
    console.error('ELO Join lobby error:', error);
    await message.reply('❌ Failed to join lobby. Please try again.');
  }
}

async function handleEloLobbyFull(lobby) {
  lobby.status = 'forming_teams';
  
  // Select captains (highest rated players)
  const sortedPlayers = Array.from(lobby.players.values())
    .sort((a, b) => b.rating - a.rating);
  
  lobby.captains = [sortedPlayers[0], sortedPlayers[1]];

  const embed = new EmbedBuilder()
    .setColor('#ffaa00')
    .setTitle('🏆 ELO Lobby Full - Team Formation!')
    .setDescription('The lobby is now full! Captains will pick teams.')
    .addFields(
      { name: 'Captain 1', value: `${lobby.captains[0].name} (${lobby.captains[0].position}) - Rating: ${lobby.captains[0].rating}`, inline: false },
      { name: 'Captain 2', value: `${lobby.captains[1].name} (${lobby.captains[1].position}) - Rating: ${lobby.captains[1].rating}`, inline: false },
      { name: 'Next Step', value: 'Captains use `!pick @player` to select team members', inline: false }
    )
    .setTimestamp();

  await lobby.channel.send({ embeds: [embed] });

  // Start team formation timer
  setTimeout(() => {
    if (lobby.status === 'forming_teams') {
      handleEloLobbyTimeout(lobby);
    }
  }, ELO_CONFIG.lobbyTimeout);
}

// ELO Team Formation
async function handleEloPick(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  if (args.length < 1) {
    return message.reply('❌ Usage: `!pick @player`');
  }

  const mentionedUser = message.mentions.users.first();
  if (!mentionedUser) {
    return message.reply('❌ Please mention a player to pick');
  }

  // Find lobby where user is captain
  let lobby = null;
  for (const [lobbyId, lobbyData] of activeLobbies) {
    if (lobbyData.captains.some(captain => captain.id === message.author.id)) {
      lobby = lobbyData;
      break;
    }
  }

  if (!lobby) {
    return message.reply('❌ You are not a captain in any active lobby');
  }

  if (lobby.status !== 'forming_teams') {
    return message.reply('❌ Team formation is not active');
  }

  // Check if player is available
  if (!lobby.players.has(mentionedUser.id)) {
    return message.reply('❌ That player is not in this lobby');
  }

  const player = lobby.players.get(mentionedUser.id);
  if (player.team) {
    return message.reply('❌ That player has already been picked');
  }

  // Assign player to captain's team
  const captainIndex = lobby.captains.findIndex(captain => captain.id === message.author.id);
  const teamNumber = captainIndex + 1;
  player.team = teamNumber;

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('👥 ELO Player Picked!')
    .setDescription(`**${player.name}** (${player.position}) has been picked by **${message.author.username}**`)
    .addFields(
      { name: 'Team', value: `Team ${teamNumber}`, inline: true },
      { name: 'Position', value: player.position, inline: true },
      { name: 'Rating', value: player.rating.toString(), inline: true }
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });

  // Check if all players have been picked
  const unpickedPlayers = Array.from(lobby.players.values()).filter(p => !p.team);
  if (unpickedPlayers.length === 0) {
    await handleEloTeamsFormed(lobby);
  }
}

async function handleEloTeamsFormed(lobby) {
  lobby.status = 'teams_formed';

  const team1Players = Array.from(lobby.players.values()).filter(p => p.team === 1);
  const team2Players = Array.from(lobby.players.values()).filter(p => p.team === 2);

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🏆 ELO Teams Formed Successfully!')
    .setDescription('Both teams are ready! Use `!start` to begin the match.')
    .addFields(
      { name: 'Team 1', value: team1Players.map(p => `${p.name} (${p.position})`).join('\n'), inline: true },
      { name: 'Team 2', value: team2Players.map(p => `${p.name} (${p.position})`).join('\n'), inline: true }
    )
    .setTimestamp();

  await lobby.channel.send({ embeds: [embed] });
}

// ELO Match Management
async function handleEloStart(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  // Find lobby where user is captain
  let lobby = null;
  for (const [lobbyId, lobbyData] of activeLobbies) {
    if (lobbyData.captains.some(captain => captain.id === message.author.id)) {
      lobby = lobbyData;
      break;
    }
  }

  if (!lobby) {
    return message.reply('❌ You are not a captain in any active lobby');
  }

  if (lobby.status !== 'teams_formed') {
    return message.reply('❌ Teams must be fully formed before starting');
  }

  lobby.status = 'in_progress';
  lobby.started = Date.now();

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('🚀 ELO Match Started!')
    .setDescription('The match is now in progress! Use `!result` to report the final score.')
    .addFields(
      { name: 'Status', value: 'Match in progress', inline: true },
      { name: 'Started', value: new Date().toLocaleTimeString(), inline: true }
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleEloResult(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  if (args.length < 2) {
    return message.reply('❌ Usage: `!result <team1_score> <team2_score>`');
  }

  const team1Score = parseInt(args[0]);
  const team2Score = parseInt(args[1]);

  if (isNaN(team1Score) || isNaN(team2Score)) {
    return message.reply('❌ Scores must be valid numbers');
  }

  // Find active match for this user
  let lobby = null;
  for (const [lobbyId, lobbyData] of activeLobbies) {
    if (lobbyData.players.has(message.author.id) && lobbyData.status === 'in_progress') {
      lobby = lobbyData;
      break;
    }
  }

  if (!lobby) {
    return message.reply('❌ You are not in an active match');
  }

  try {
    // Process match result
    await processEloMatchResult(lobby, team1Score, team2Score);
    
    // Clean up lobby
    activeLobbies.delete(lobby.id);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏁 ELO Match Complete!')
      .setDescription(`Final Score: **Team 1** ${team1Score} - ${team2Score} **Team 2**`)
      .addFields(
        { name: 'Winner', value: team1Score > team2Score ? 'Team 1' : 'Team 2', inline: true },
        { name: 'Duration', value: `${Math.round((Date.now() - lobby.started) / 60000)} minutes`, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('ELO Match result error:', error);
    await message.reply('❌ Failed to process match result. Please try again.');
  }
}

async function processEloMatchResult(lobby, team1Score, team2Score) {
  const winner = team1Score > team2Score ? 1 : 2;
  const matchDuration = Math.round((Date.now() - lobby.started) / 1000);

  // Create match record
  const { data: match, error: matchError } = await supabase
    .from('elo_matches')
    .insert([{
      team1_score: team1Score,
      team2_score: team2Score,
      winner_team: winner,
      match_duration: matchDuration
    }])
    .select()
    .single();

  if (matchError) throw matchError;

  // Process individual player results
  for (const [playerId, player] of lobby.players) {
    const isWinner = player.team === winner;
    
    // Calculate rating change (simplified for team games)
    const ratingChange = isWinner ? 15 : -15;
    const newRating = Math.max(0, player.rating + ratingChange);
    
    // Update player stats
    const { error: updateError } = await supabase
      .from('elo_players')
      .update({
        elo_rating: newRating,
        total_matches: player.total_matches + 1,
        wins: player.wins + (isWinner ? 1 : 0),
        losses: player.losses + (isWinner ? 0 : 1),
        points_earned: player.points_earned + (isWinner ? ELO_CONFIG.pointsPerWin : ELO_CONFIG.pointsPerLoss),
        last_match_at: new Date().toISOString()
      })
      .eq('discord_id', playerId);

    if (updateError) throw updateError;

    // Create match player record
    const { error: matchPlayerError } = await supabase
      .from('elo_match_players')
      .insert([{
        match_id: match.id,
        player_id: playerId,
        team_number: player.team,
        position: player.position,
        rating_before: player.rating,
        rating_after: newRating,
        rating_change: ratingChange,
        points_earned: isWinner ? ELO_CONFIG.pointsPerWin : ELO_CONFIG.pointsPerLoss
      }]);

    if (matchPlayerError) throw matchPlayerError;
  }
}

// ELO Statistics
async function handleEloStats(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  try {
    const { data: player, error } = await supabase
      .from('elo_players')
      .select('*')
      .eq('discord_id', message.author.id)
      .single();

    if (error || !player) {
      return message.reply('❌ You are not registered for ELO. Use `!register @username` first.');
    }

    const winPercentage = ((player.wins / Math.max(1, player.total_matches)) * 100).toFixed(1);
    const tier = getEloRatingTier(player.elo_rating);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 ELO Stats for ${player.display_name}`)
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: 'Rating', value: player.elo_rating.toString(), inline: true },
        { name: 'Tier', value: tier, inline: true },
        { name: 'Position', value: player.position, inline: true },
        { name: 'Matches', value: player.total_matches.toString(), inline: true },
        { name: 'Wins', value: player.wins.toString(), inline: true },
        { name: 'Losses', value: player.losses.toString(), inline: true },
        { name: 'Win Rate', value: `${winPercentage}%`, inline: true },
        { name: 'Points Earned', value: player.points_earned.toString(), inline: true },
        { name: 'Highest Rating', value: player.highest_rating.toString(), inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('ELO Stats error:', error);
    await message.reply('❌ Failed to fetch ELO stats. Please try again.');
  }
}

async function handleEloRankings(message, args) {
  // Check if ELO system is available
  if (!(await isEloSystemAvailable())) {
    return message.reply('❌ ELO system is not available yet. Please run the database migration first.');
  }

  try {
    const { data: players, error } = await supabase
      .from('elo_players')
      .select('*')
      .order('elo_rating', { ascending: false })
      .limit(10);

    if (error) throw error;

    const embed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle('🏆 Top 10 ELO Rankings')
      .setDescription('The highest rated players in the ELO system');

    let description = '';
    players.forEach((player, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const tier = getEloRatingTier(player.elo_rating);
      description += `${medal} **${player.display_name}** - ${player.elo_rating} (${tier})\n`;
    });

    embed.setDescription(description);
    embed.setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('ELO Rankings error:', error);
    await message.reply('❌ Failed to fetch ELO rankings. Please try again.');
  }
}

// ELO Utility Functions
function getEloRatingTier(rating) {
  if (rating >= 2400) return 'Grandmaster';
  if (rating >= 2100) return 'Master';
  if (rating >= 1800) return 'Expert';
  if (rating >= 1500) return 'Advanced';
  if (rating >= 1200) return 'Intermediate';
  return 'Beginner';
}

async function handleEloLobbyTimeout(lobby) {
  lobby.status = 'cancelled';
  
  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('⏰ ELO Lobby Timed Out')
    .setDescription('The lobby timed out due to inactivity. Players can join a new lobby.')
    .setTimestamp();

  await lobby.channel.send({ embeds: [embed] });
  
  activeLobbies.delete(lobby.id);
}

// ELO Help Command
async function handleEloHelp(message) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🤖 SCSFC Enhanced Bot - ELO Commands')
    .setDescription('Here are all available ELO commands:')
    .addFields(
      { name: '🎯 Registration', value: '`!register @username` - Register for ELO matches\n`!position C/LW/RW/D/G` - Set your position', inline: false },
      { name: '🎮 Lobby System', value: '`!join` - Join a lobby\n`!leave` - Leave current lobby\n`!lobby` - Show lobby status', inline: false },
      { name: '👥 Team Formation', value: '`!pick @player` - Pick a player for your team\n`!start` - Start the match', inline: false },
      { name: '🏁 Match Results', value: '`!result <score1> <score2>` - Report match result', inline: false },
      { name: '📊 Statistics', value: '`!stats` - Show your ELO stats\n`!rankings` - Show top 10 rankings', inline: false },
      { name: '❓ Help', value: '`!help` - Show this help message', inline: false }
    )
    .addFields(
      { name: '📋 Positions', value: 'C (Center), LW (Left Wing), RW (Right Wing), D (Defense), G (Goalie)', inline: false },
      { name: '🏆 Scoring', value: `Win: ${ELO_CONFIG.pointsPerWin} points, Loss: ${ELO_CONFIG.pointsPerLoss} points, Draw: ${ELO_CONFIG.pointsPerDraw} points`, inline: false }
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

// ==================== MESSAGE HANDLER ====================

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.guild?.id !== GUILD_ID) return;

  // Handle existing SCS commands
  if (message.content.startsWith("!link")) {
    const args = message.content.split(" ");
    if (args.length < 2) {
      message.reply("Usage: !link <your-scsfc-username>");
      return;
    }

    const scsUsername = args[1];

    try {
      console.log(`🔗 Attempting to link Discord user ${message.author.tag} to SCS username: ${scsUsername}`);

      // First, check if the SCS user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("gamer_tag_id", scsUsername)
        .single();

      if (userError || !user) {
        console.log(`❌ SCS user not found: ${scsUsername}`);
        message.reply("❌ SCSFC user not found. Please check your username and try again.");
        return;
      }

      console.log(`✅ Found SCS user: ${user.gamer_tag_id} (ID: ${user.id})`);

      // Check if this Discord account is already linked
      const { data: existingDiscordUser, error: existingError } = await supabase
        .from("discord_users")
        .select("*")
        .eq("discord_id", message.author.id)
        .single();

      if (existingDiscordUser) {
        console.log(`❌ Discord account already linked to another SCS user`);
        message.reply("❌ This Discord account is already linked to another SCSFC user.");
        return;
      }

      // Check if this SCS account is already linked to another Discord account
      const { data: existingScsUser, error: scsError } = await supabase
        .from("discord_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (existingScsUser) {
        console.log(`❌ SCS account already linked to another Discord user`);
        message.reply("❌ This SCSFC account is already linked to another Discord account.");
        return;
      }

      // Create the Discord-SCS link
      const { error: insertError } = await supabase
        .from("discord_users")
        .insert({
          user_id: user.id,
          discord_id: message.author.id,
          discord_username: message.author.tag,
        });

      if (insertError) {
        console.error(`❌ Error creating Discord-SCS link:`, insertError);
        message.reply("❌ Error linking account. Please try again.");
        return;
      }

      console.log(`✅ Successfully created Discord-SCS link`);

      // Add the registered role
      try {
        await message.member.roles.add(REGISTERED_ROLE_ID);
        console.log(`✅ Added registered role to ${message.author.tag}`);
      } catch (roleError) {
        console.error(`⚠️ Warning: Could not add registered role:`, roleError);
      }

      // Sync user roles
      try {
        await syncUserRoles(message.author.id);
        console.log(`✅ Synced roles for ${message.author.tag}`);
      } catch (syncError) {
        console.error(`⚠️ Warning: Could not sync roles:`, syncError);
      }

      console.log(`✅ Successfully linked Discord user ${message.author.tag} to SCS account ${scsUsername}`);
      message.reply(`✅ Successfully linked to SCSFC account: **${scsUsername}**\n\nYou now have access to:\n• 🏒 Team management features\n• 🎮 ELO competitive matches (after setup)\n• 📊 Player statistics`);

    } catch (error) {
      console.error("❌ Error in !link command:", error);
      message.reply("❌ An unexpected error occurred while linking your account. Please try again or contact an administrator.");
    }
  }

  // Handle ELO commands
  if (message.content.startsWith(ELO_CONFIG.prefix)) {
    const args = message.content.slice(ELO_CONFIG.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case 'register':
          await handleEloRegister(message, args);
          break;
        case 'position':
          await handleEloPosition(message, args);
          break;
        case 'join':
          await handleEloJoin(message, args);
          break;
        case 'pick':
          await handleEloPick(message, args);
          break;
        case 'start':
          await handleEloStart(message, args);
          break;
        case 'result':
          await handleEloResult(message, args);
          break;
        case 'stats':
          await handleEloStats(message, args);
          break;
        case 'rankings':
          await handleEloRankings(message, args);
          break;
        case 'help':
          await handleEloHelp(message);
          break;
        default:
          // Only show error for ELO-specific commands
          if (['register', 'position', 'join', 'pick', 'start', 'result', 'stats', 'rankings', 'help'].includes(command)) {
            await message.reply('❌ Unknown ELO command. Use `!help` for available commands.');
          }
      }
    } catch (error) {
      console.error('Error handling ELO command:', error);
      await message.reply('❌ An error occurred while processing your ELO command.');
    }
  }
});

// ==================== ERROR HANDLING ====================

client.on("error", console.error);

// ==================== BOT LOGIN ====================

client.login(BOT_TOKEN);

// ==================== UTILITY FUNCTIONS ====================

// Placeholder for existing functions
function checkTwitchStreams() {
  // Your existing Twitch stream checking logic
  console.log("Checking Twitch streams...");
}
