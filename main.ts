import { REST, Routes, Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
import { config } from 'dotenv';
import { Server } from './structure/server';

config();

const commands: {
    [key: string]: {
        data: any,
        execute: (interaction: any) => Promise<void>
    }
} = {
    start: {
        data: new SlashCommandBuilder()
            .setName('start')
            .setDescription('Starts the server'),
        execute: async (interaction) => {
            const s = Server.cache.get(interaction.guildId as string);
            if (!s) return await interaction.reply('Server not found!');
            s.start();
            await interaction.reply('Server started!');
        }
    },
    stop: {
        data: new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Stops the server'),
        execute: async (interaction) => {
            const s = Server.cache.get(interaction.guildId as string);
            if (!s) return await interaction.reply('Server not found!');
            s.stop();
            await interaction.reply('Server stopped!');
        }
    },
    set: {
        data: new SlashCommandBuilder()
            .setName('set')
            .setDescription('Sets the server jar')
            .addStringOption((option: any) => option.setName('name').setDescription('The name of the server').setRequired(true)),
        execute: async (interaction) => {
            try {
                new Server(interaction.guildId, interaction.options.getString('name'));
                await interaction.reply('Server created!');
            } catch (error) {
                interaction.reply('Error: ' + 'Server already exists!');
            }
        }
    },
    online: {
        data: new SlashCommandBuilder()
            .name('online')
            .setDescription('Gets the online players'),
        execute: async (interaction) => {
            const s = Server.cache.get(interaction.guildId as string);
            if (!s) return await interaction.reply('Server not found!');
            const players = await s.getPlayers();
            await interaction.reply(`${players.length} players online: ${players.join(', ')}`);
        }
    }
}

const main = async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID as string), { body: Object.values(commands).map(c => c.data) });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user?.tag}!`);
    });

    client.on('interactionCreate', async (interaction: any) => {
        if (!interaction.isChatInputCommand()) return;

        const command = commands[interaction.commandName];
        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });
    client.login(process.env.DISCORD_TOKEN);
}



main();