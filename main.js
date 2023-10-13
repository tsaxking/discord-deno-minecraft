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
const server_1 = require("./server");
(0, dotenv_1.config)();
const s = new server_1.Server('vh-mc');
const commands = [
    {
        name: 'start',
        description: 'Starts the server',
        execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
            s.start();
            yield interaction.reply('Starting server...');
        })
    },
];
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        yield rest.put(discord_js_1.Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID), { body: commands.map(c => ({
                name: c.name,
                description: c.description,
                options: c.options
            }))
        });
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
        const command = commands.find(c => c.name === interaction.commandName);
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
