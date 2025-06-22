# Discord Move Everyone

A sleek and powerful Node.js script to manage Discord servers by moving members to specified voice channels. Built with `discord.js-selfbot-v13`, this tool provides an interactive CLI with a vibrant interface to streamline server control.

⚠️ **Important:** Using self-bots violates Discord's Terms of Service and can lead to account bans. Use this script at your own risk, preferably for educational purposes only.

## Features

- **Interactive Menu:** Easy-to-use CLI with colorful prompts for logging in, moving members, and exiting.
- **Voice Channel Management:** Move all members in voice channels to a specified voice channel with permission checks.
- **Rate Limit Handling:** Automatically retries failed actions due to Discord API rate limits.
- **Action History:** Tracks the last 5 actions for quick reference.
- **Visual Flair:** Eye-catching ASCII art and neon cyan color scheme for a modern look.

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- A valid Discord user token (not a bot token)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/breakmetoo/discord-move-maestro.git
   ```
2. Navigate to the directory:
   ```
   cd discord-move-maestro
   ```
3. Install dependencies:
   ```
   npm install discord.js-selfbot-v13 chalk
   ```

## Usage

1. Run the script:
   ```
   node index.js
   ```
2. Follow the interactive menu:
   - **Option 1:** Log in with your Discord token (find it in Discord Developer Tools: Ctrl+Shift+I > Application > Local Storage).
   - **Option 2:** Select a server and voice channel to move all members in voice channels to the chosen channel.
   - **Option 3:** Exit the script cleanly.
3. Ensure you have the necessary permissions ("Move Members" and "Connect") in the target server and voice channel.

### Demo
![Démonstration du déplacement des utilisateurs Discord](ezgif-1a74c9c65ae008.gif)


## Example

```
╔═══════════════════════════════╗
║  🌩️ DISCORD MOVE MAESTRO 🌩️  ║
║      PRIME CONTROL ARENA      ║
╚═══════════════════════════════╝
⚡ Command Your Server with Flair! ⚡

📡 Status: Disconnected

⚙️ Options:
 1️⃣ Log in with a Discord token
 2️⃣ Move everyone to a voice channel
 3️⃣ Exit
```

## Contributing


Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes (`git commit -m 'Add awesome feature'`).
4. Push to the branch (`git push origin feature/awesome-feature`).
5. Open a pull request.

## Disclaimer

This project is for educational purposes only. The author is not responsible for any misuse or consequences, including account bans from Discord. Always respect Discord's Terms of Service.

## License

MIT License
