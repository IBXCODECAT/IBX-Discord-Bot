// Import necessary modules and dependencies
require('dotenv').config();
import fs from 'fs';
import path from 'path';

import { Client, GatewayIntentBits } from 'discord.js';
import { ClientData, GLOBAL_COMMONJS_FILE_EXTENSION } from './resources/structures';
import { Cooldown, Command } from './resources/structures';
import chalk from 'chalk';
import i18next from 'i18next';
import I18NextFSBackend from 'i18next-fs-backend';

// Initialize arrays to store commands and cooldowns
const commands: Command[] = [];
const cooldowns: Cooldown[] = [];

// Create a ClientData instance to store client-related data
const client = new ClientData(new Client({ intents: [GatewayIntentBits.Guilds] }), commands, cooldowns);

// Define the path to the directory containing command files
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Initialize i18next
i18next
  .use(I18NextFSBackend)
  .init({
    lng: 'en', // The default language to use
    fallbackLng: 'en', // Fallback language in case a translation is missing
    initImmediate: false, // Set to false to prevent calling the callback function before the translation data is loaded
    backend: {
      loadPath: `${__dirname}\\locales\\{{lng}}.json`, // Path to your translation files
    },
  });

  console.log(`${__dirname}\\locales\\{{lng}}.json`);
  
  const i18next_test = i18next.t('cmd.slash.translate.description', { lng: 'ru'});
  console.log(chalk.greenBright(i18next_test));

console.log(chalk.cyanBright(`Found ${commandFolders.length} command folder(s)...`));

// Loop through command folders
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith(GLOBAL_COMMONJS_FILE_EXTENSION));

    console.log(chalk.cyanBright(`Found ${commandFiles.length} command(s) in folder ${folder}...`));

    // Loop through command files in each folder
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const m_command = require(filePath);
        const command = m_command.default;

        // Check if the required properties exist in the command object
        if ('cooldown' in command && 'data' in command && 'execute' in command && 'guilds' in command) {
            // Create a new Command instance and add it to the commands array
            const cmd = new Command(command.cooldown, command.commandName, command.data, command.execute, command.guilds);
            client.commands.push(cmd);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}


// Define the path to the directory containing event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith(GLOBAL_COMMONJS_FILE_EXTENSION));

console.log(chalk.cyanBright(`Found ${eventFiles.length} event(s)... See below for details:`));

// Loop through event files
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    console.log(event.default);

    // Attach event handlers to the client
    if (event.once) {
        client.discordClient.once(event.default.name, (...args) => event.default.execute(client, ...args));
    } else {
        client.discordClient.on(event.default.name, (...args) => event.default.execute(client, ...args));
    }
}

// Log in to Discord with your bot's token
client.discordClient.login(process.env.DISCORD_BOT_TOKEN);