const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const chalk = require('chalk');

const client = new Client({ checkUpdate: false });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let token = '';
let rateLimitInfo = { remaining: Infinity, reset: 0 };
let actionHistory = [];

function addToHistory(action) {
  actionHistory.unshift(action);
  if (actionHistory.length > 5) actionHistory.pop();
}

function showLoading(message, duration = 2000) {
  return new Promise((resolve) => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const start = setInterval(() => {
      process.stdout.write('\r' + chalk.yellow(frames[i % frames.length]) + ' ' + chalk.cyan(message));
      i++;
    }, 100);
    setTimeout(() => {
      clearInterval(start);
      process.stdout.write('\r' + chalk.green('✔ Fini !\n\n'));
      resolve();
    }, duration);
  });
}

function showMenu() {
  console.clear();

console.log(chalk.cyanBright.bold(' ╔═══════════════════════════════╗ '));
console.log(chalk.cyanBright.bold(' ║     🌩️  DISCORD MOVE  🌩️     ║'));
console.log(chalk.cyanBright.bold(' ║      Power by Breakmetoo      ║ '));
console.log(chalk.cyanBright.bold(' ╚═══════════════════════════════╝ '));

  console.log(chalk.bold('📡 Statut token :') + (client.isReady() ? chalk.green(` Connecté en tant que ${client.user?.tag || 'Inconnu'}`) : chalk.red(' Déconnecté')));
  console.log('\n' + chalk.bold('⚙️ Options :'));
  console.log(chalk.bgBlack('╔════════════════════════════╗'));
  console.log(' 1️⃣ ' + chalk.greenBright('Se connecter avec un token'));
  console.log(' 2️⃣ ' + chalk.blueBright('Déplacer tout le monde dans un vocal'));
  console.log(' 3️⃣ ' + chalk.yellowBright('Quitter'));
  console.log(chalk.bgBlack('╚════════════════════════════╝'));
  console.log('\n' + chalk.bold('📜 Dernières actions :'));
  if (actionHistory.length === 0) {
    console.log(chalk.gray('  - Rien pour l\'instant.'));
  } else {
    actionHistory.forEach((action, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${action}`));
    });
  }
  console.log('\n' + chalk.italic('ℹ️ Tape le numéro de ton choix et appuie sur Entrée.'));
  rl.question(chalk.bold('➡️ Choix (1-3) : '), handleMenu);
}






async function handleMenu(choice) {
  switch (choice.trim()) {
    case '1':
      rl.question(chalk.cyan('🔑 Entre ton token Discord (garde-le secret) : '), async (input) => {
        token = input.trim();
        if (!token || token.length < 50) {
          console.log(chalk.red('❌ Token trop court ou vide. Il faut +50 caractères.'));
          console.log(chalk.yellow('ℹ️ Trouve ton token dans les outils dev Discord (Ctrl+Shift+I > Application > Local Storage).'));
          await delay(2000);
          showMenu();
          return;
        }
        await showLoading('Connexion en cours...', 2000);
        addToHistory(`Tentative de connexion à ${new Date().toLocaleTimeString()}`);
        client.login(token).catch((err) => {
          console.log(chalk.red(`❌ Connexion échouée : ${err.message}`));
          console.log(chalk.yellow('ℹ️ Vérifie ton token, ta connexion ou l\'installation de discord.js-selfbot-v13.'));
          addToHistory(`Échec connexion : ${err.message}`);
          showMenu();
        });
      });
      break;
    case '2':
      if (!client.isReady()) {
        console.log(chalk.red('❌ Connecte-toi d\'abord avec l\'option 1.'));
        await delay(2000);
        showMenu();
        return;
      }
      console.log(chalk.cyan('\n📋 Tes serveurs :'));
      client.guilds.cache.forEach((guild) => {
        console.log(chalk.gray(`  - ${guild.name} (ID: ${guild.id})`));
      });
      rl.question(chalk.bold('➡️ Entre l\'ID du serveur : '), async (guildId) => {
        const guild = client.guilds.cache.get(guildId.trim());
        if (!guild) {
          console.log(chalk.red('❌ ID de serveur invalide ou tu n\'es pas dedans. Vérifie la liste.'));
          await delay(2000);
          showMenu();
          return;
        }
        console.log(chalk.cyan(`\n🔊 Salons vocaux dans ${guild.name} :`));
        const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE');
        if (voiceChannels.size === 0) {
          console.log(chalk.red('❌ Aucun salon vocal trouvé dans ce serveur.'));
          await delay(2000);
          showMenu();
          return;
        }
        voiceChannels.forEach((channel) => {
          console.log(chalk.gray(`  - ${channel.name} (ID: ${channel.id})`));
        });
        rl.question(chalk.bold('➡️ Entre l\'ID du salon vocal : '), async (channelId) => {
          addToHistory(`Déplacement vers salon ${channelId} dans ${guild.name}`);
          await moveEveryoneToVoiceChannel(guild, channelId.trim());
        });
      });
      break;
    case '3':
      await showLoading('Crée par breakmetoo ...', 1500);
      console.log(chalk.green('👋 À plus !'));
      client.destroy();
      rl.close();
      process.exit(0);
    default:
      console.log(chalk.red('❌ Choix invalide. Tape 1, 2 ou 3.'));
      await delay(1500);
      showMenu();
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function moveMemberWithRetry(member, targetChannel, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await member.voice.setChannel(targetChannel, 'Déplacé par le bot');
      console.log(chalk.green(`Déplacé ${member.user.tag} de ${member.voice.channel.name} vers ${targetChannel.name}.`));
      return true;
    } catch (err) {
      if (err.code === 429 && attempt < maxRetries) {
        const retryAfter = err.retryAfter || 1000;
        console.log(chalk.yellow(`Limite atteinte pour ${member.user.tag}. Réessai dans ${retryAfter}ms (${attempt}/${maxRetries})...`));
        await delay(retryAfter);
        continue;
      }
      console.log(chalk.red(`Échec du déplacement de ${member.user.tag} : ${err.message}`));
      return false;
    }
  }
  return false;
}

async function moveEveryoneToVoiceChannel(guild, targetVoiceChannelId) {
  const targetChannel = guild.channels.cache.get(targetVoiceChannelId);

  if (!targetChannel) {
    console.log(chalk.red('❌ Salon vocal introuvable.'));
    await delay(2000);
    showMenu();
    return;
  }

  if (targetChannel.type !== 'GUILD_VOICE') {
    console.log(chalk.red('❌ Cet ID n\'est pas un salon vocal.'));
    await delay(2000);
    showMenu();
    return;
  }

  const me = guild.members.cache.get(client.user.id);
  if (!me) {
    console.log(chalk.red('❌ Impossible de récupérer tes données. Vérifie que tu es dans le serveur.'));
    await delay(2000);
    showMenu();
    return;
  }
  if (!me.permissionsIn(targetChannel).has(['MOVE_MEMBERS', 'CONNECT'])) {
    console.log(chalk.red('❌ Il te faut les permissions "Déplacer les membres" et "Se connecter".'));
    await delay(2000);
    showMenu();
    return;
  }

  await showLoading(`Déplacement des membres vers ${targetChannel.name}...`, 2000);
  let movedCount = 0;
  let failedCount = 0;

  const membersInVoice = guild.members.cache.filter((member) => {
    if (!member.voice.channel || member.id === client.user.id) return false;
    const channel = member.voice.channel;
    const permissions = channel.permissionsFor(guild.members.me);
    return permissions.has(['VIEW_CHANNEL', 'CONNECT']);
  });

  if (membersInVoice.size === 0) {
    console.log(chalk.yellow('⚠️ Aucun membre dans les vocaux publics.'));
    await delay(2000);
    showMenu();
    return;
  }

  const batchSize = Math.min(rateLimitInfo.remaining || 5, 5);
  const baseBatchDelay = 100;
  const membersArray = Array.from(membersInVoice.values());

  for (let i = 0; i < membersArray.length; i += batchSize) {
    const batch = membersArray.slice(i, i + batchSize);
    const movePromises = batch.map(async (member) => {
      if (member.voice.channel.id !== targetVoiceChannelId) {
        return await moveMemberWithRetry(member, targetChannel);
      }
      return false;
    });

    const results = await Promise.all(movePromises);
    movedCount += results.filter((result) => result === true).length;
    failedCount += results.filter((result) => result === false).length;

    const now = Date.now();
    let batchDelay = baseBatchDelay;
    if (rateLimitInfo.reset > now) {
      batchDelay = Math.max(batchDelay, rateLimitInfo.reset - now + 50);
    }

    console.log(chalk.cyan(`Groupe ${Math.floor(i / batchSize) + 1}/${Math.ceil(membersArray.length / batchSize)} terminé. Attente ${batchDelay}ms...`));
    if (i + batchSize < membersArray.length) {
      await delay(batchDelay);
    }
  }

  console.log(chalk.green(`✅ Terminé ! ${movedCount} membres déplacés vers ${targetChannel.name}. ${failedCount} échecs.`));
  await delay(2000);
  showMenu();
}

client.once('ready', () => {
  console.log(chalk.green(`✅ Connecté en tant que ${client.user.tag} ! Prêt à l\'action.`));
  addToHistory(`Connecté en tant que ${client.user.tag}`);
  showMenu();
});

client.on('error', (err) => {
  console.log(chalk.red(`❌ Erreur : ${err.message}. Reconnecte-toi ou vérifie ton setup.`));
  addToHistory(`Erreur : ${err.message}`);
  showMenu();
});

client.on('rateLimit', (info) => {
  console.log(chalk.yellow(`⚠️ Limite atteinte : ${JSON.stringify(info)}. Ajustement des délais...`));
  rateLimitInfo = {
    remaining: info.global ? 0 : info.remaining || 0,
    reset: Date.now() + (info.timeout || 1000),
  };
  addToHistory(`Limite atteinte : ${info.timeout}ms`);
});

console.log(chalk.cyan('🚀 Starting...'));
console.log(chalk.yellow('ℹ️ Assure-toi d\'avoir installé discord.js-selfbot-v13 et chalk (npm install discord.js-selfbot-v13 chalk). ⛔ Se script est pour un usage personnel uniquement.'));
showMenu();