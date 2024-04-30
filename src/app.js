const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");
const { GameDig } = require("gamedig");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.BOT_TOKEN;
const SRCDS_IP = process.env.SERVER_IP;
const SRCDS_PORT = process.env.SERVER_PORT;
const CHANNEL_ID = process.env.STATUS_CHANNEL ;

function mapRename(value) {
  if (value === "de_dust2") {
    return "Dust 2";
  } else if (value === "de_mirage") {
    return "Mirage";
  } else if (value === "de_inferno") {
    return "Inferno";
  } else if (value === "de_nuke") {
    return "Nuke";
  } else if (value === "de_overpass") {
    return "Overpass";
  } else if (value === "de_train") {
    return "Train";
  } else if (value === "de_vertigo") {
    return "Vertigo";
  } else if (value === "de_ancient") {
    return "Ancient";
  } else if (value === "de_cache") {
    return "Cache";
  } else if (value === "de_cbble") {
    return "Cobblestone";
  } else if (value === "de_dust") {
    return "Dust";
  } else {
    return value;
  }
}
function mapImage(value) {
  if (value === "de_dust2") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-dust-2.jpg";
  } else if (value === "de_mirage") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-mirage.jpg";
  } else if (value === "de_inferno") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-inferno.jpg";
  } else if (value === "de_nuke") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-nuke.jpg";
  } else if (value === "de_overpass") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-overpass.jpg";
  } else if (value === "de_train") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-train.jpg";
  } else if (value === "de_vertigo") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/09/counter-strike-2-maps-vertigo.jpg";
  } else if (value === "de_ancient") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/03/counter-strike-2-maps-ancient.jpg";
  } else if (value === "de_cache") {
    return "https://dotesports.com/wp-content/uploads/2023/07/cache.jpg";
  } else if (value === "de_cbble") {
    return "https://steamuserimages-a.akamaihd.net/ugc/2196127907124047258/9A32E6975D46255B22F62EAA2630C7AD1FA1127D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true";
  } else if (value === "de_anubis") {
    return "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/09/counter-strike-2-maps-anubis.jpg";
  } else {
    return value;
  }
}

let statusMessage;

client.on("ready", async () => {
  console.debug(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`Sunucuya Bağlanılıyor!`, { type: "PLAYING" });
  // if(client.user.tag !== botName){
  //   client.user.setUsername(botName);
  // }

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (channel) {
    try {
      // Önceki mesajları sil
      await channel.messages.fetch({ limit: 1 }).then((messages) => {
        channel.bulkDelete(messages);
      });

      const response = await GameDig.query({
        type: "counterstrike2",
        host: SRCDS_IP,
        port: SRCDS_PORT,
      });

      const players = response.players.length;
      const maxPlayers = response.maxplayers;
      const playerCount = `${players}/${maxPlayers}`;
      const map = mapRename(response.map);
      const serverName = response.name;

      statusMessage = await channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor("#fc0303")
          .setThumbnail("https://cdn.discordapp.com/icons/558222188839436309/a_37672e744f64066edbe34f84766df11c.gif")
          .setTitle(serverName)
          .setDescription("Aşağıda sunucu istatistikleri görüntülenmektedir!")
          .addFields({
            name: "**Harita** 🗺️",
            value: `*${map}*`,
            inline: true,
          },
          {
            name: "**Oyuncu Sayısı** 👾",
            value: `*${playerCount}* kişi oyunda`,
            inline: true,
          })
          .addFields({
            name: "**Sunucu IP** 🌐",
            value: `*${SRCDS_IP}:${SRCDS_PORT}*`,
            inline: false,
          },
          {
            name: "**Hızlı Bağlan** 👾",
            value: `[Sunucuya Bağlan](https://theeaglesclan.cs2.biz.tr)`,
            inline: true,
          })
          .setImage(mapImage(response.map))
          .setFooter({
            iconURL:
              "https://cdn.discordapp.com/icons/558222188839436309/a_37672e744f64066edbe34f84766df11c.gif",
            text: "The Eagles Clan Oyuncu Topluluğu",
          })
          .setTimestamp(),
        ],
      });

      client.user.setPresence({
        activities: [
          {
            name: `${playerCount} kişi 🗺️${map} haritasında Oynuyor`,
            type: ActivityType.Watching,
          },
        ],
        status: "dnd",
      });

      // Her 10 saniyede bir güncelleme yap
      setInterval(updatePlayerCount, 5000);
    } catch (error) {
      console.error("Oyuncu sayısı güncelleme hatası:", error);
    }
  } else {
    console.error("Kanal bulunamadı!");
  }
});

async function updatePlayerCount() {
  try {
    const response = await GameDig.query({
      type: "counterstrike2",
      host: SRCDS_IP,
      port: SRCDS_PORT,
    });

    const players = response.players.length;
    const maxPlayers = response.maxplayers;
    const playerCount = `${players}/${maxPlayers}`;
    const map = mapRename(response.map);
    const serverName = response.name;

    // Mesajı güncelle
    statusMessage.edit({
      embeds: [
        new EmbedBuilder()
        .setColor("#fc0303")
        .setThumbnail("https://cdn.discordapp.com/icons/558222188839436309/a_37672e744f64066edbe34f84766df11c.gif")
        .setTitle(serverName)
        .setDescription("Aşağıda sunucu istatistikleri görüntülenmektedir!")
        .addFields({
          name: "**Harita** 🗺️",
          value: `*${map}*`,
          inline: true,
        },
        {
          name: "**Oyuncu Sayısı** 👾",
          value: `*${playerCount}* kişi oyunda`,
          inline: true,
        })
        .addFields({
          name: "**Sunucu IP** 🌐",
          value: `*${SRCDS_IP}:${SRCDS_PORT}*`,
          inline: false,
        },
        {
          name: "**Hızlı Bağlan** 👾",
          value: `[Sunucuya Bağlan](https://theeaglesclan.cs2.biz.tr)`,
          inline: true,
        })
        .setImage(mapImage(response.map))
        .setFooter({
          iconURL:
            "https://cdn.discordapp.com/icons/558222188839436309/a_37672e744f64066edbe34f84766df11c.gif",
          text: "The Eagles Clan Oyuncu Topluluğu",
        })
        .setTimestamp(),
      ],
    });

    client.user.setPresence({
      activities: [
        {
          name: `${playerCount} kişi 🗺️${map} haritasında Oynuyor`,
          type: ActivityType.Watching,
        },
      ],
      status: "dnd",
    });
  } catch (error) {
    console.error("Oyuncu sayısı güncelleme hatası:", error);
  }
}

client.login(TOKEN);
