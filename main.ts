import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { Server } from './server';

config();

const s = new Server('vh-mc');


const commands: {
    name: string;
    description: string;
    options?: any[];
    execute: (interaction: any) => Promise<void>;
}[] = [
    {
        name: 'start',
        description: 'Starts the server',
        execute: async (interaction: any) => {
            s.start();
            await interaction.reply('Starting server...');
        }
    }
];

const main = async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID as string), { body: commands.map(c => ({
                name: c.name,
                description: c.description,
                options: c.options
            })) 
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user?.tag}!`);
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const command = commands.find(c => c.name === interaction.commandName);
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