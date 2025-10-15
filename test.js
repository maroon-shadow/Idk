export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Only POST requests are allowed.", { status: 405 });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON body.", { status: 400 });
    }

    const AUTH_KEY = "your_secret_key"; // optional
    const authHeader = request.headers.get("Authorization");
    if (AUTH_KEY && authHeader !== `Bearer ${AUTH_KEY}`) {
      return new Response("Unauthorized", { status: 403 });
    }

    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/XXXX/XXXX";

    const embed = {
      title: "📡 Telemetry Report",
      color: 0x00bfff,
      fields: [
        { name: "Room", value: data.directory || "Unknown", inline: true },
        { name: "Player", value: data.identity || "Unknown", inline: true },
        { name: "Region", value: data.region || "?", inline: true },
        { name: "User ID", value: data.userid || "?", inline: false },
        { name: "Game Mode", value: data.gameMode || "?", inline: true },
        { name: "Player Count", value: data.playerCount?.toString() || "?", inline: true },
        { name: "Private", value: data.isPrivate ? "Yes" : "No", inline: true },
        { name: "Console", value: `${data.consoleVersion || "?"}`, inline: true },
        { name: "Menu", value: `${data.menuName || "?"} v${data.menuVersion || "?"}`, inline: true }
      ],
      timestamp: new Date().toISOString(),
    };

    const payload = {
      username: "Shadow Bot",
      embeds: [embed],
    };

    const discordRes = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (discordRes.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const text = await discordRes.text();
      return new Response(JSON.stringify({ error: "Failed to send", details: text }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};