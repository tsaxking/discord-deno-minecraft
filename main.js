"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const commands = {
    start: {
        data: new discord_js_1.SlashCommandBuilder()
            .setName('start')
            .setDescription('Starts the server'),
        execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
            // const server = new Server(interaction.guildId as string);
            // server.start();
            yield interaction.reply('Server started!');
        })
    },
    stop: {
        data: new discord_js_1.SlashCommandBuilder()
            .setName('stop')
            .setDescription('Stops the server'),
        execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
            // const server = new Server(interaction.guildId as string);
            // server.stop();
            yield interaction.reply('Server stopped!');
        })
    },
    set: {
        data: new discord_js_1.SlashCommandBuilder()
            .setName('set')
            .setDescription('Sets the server jar')
            .addStringOption(option => option.setName('name').setDescription('The name of the server').setRequired(true)),
        execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
            yield interaction.reply('Received: ' + interaction.options.getString('name'));
        })
    }
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        yield rest.put(discord_js_1.Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID), { body: Object.values(commands).map(c => c.data) });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
    const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
    client.on('ready', () => {
        var _a;
        console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
    });
    client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.isChatInputCommand())
            return;
        const command = commands[interaction.commandName];
        if (command) {
            try {
                yield command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                yield interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }));
    client.login(process.env.DISCORD_TOKEN);
});
main();
