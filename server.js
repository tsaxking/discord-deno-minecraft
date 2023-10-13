"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class Server {
    constructor(id) {
        this.id = id;
    }
    get serverPath() {
        return path_1.default.resolve(__dirname, './servers', this.id);
    }
    runCommand(command, ...args) {
        if (this.child) {
            this.child.kill();
        }
        this.child = (0, child_process_1.spawn)(command, args, {
            cwd: this.serverPath,
            stdio: 'inherit'
        });
        this.child.on('exit', () => {
            this.child = undefined;
        });
    }
    start() {
        this.runCommand('java', '-jar', 'server.jar', 'nogui');
    }
    stop() {
        this.runCommand('stop');
    }
}
exports.Server = Server;
Server.cache = new Map();
const exit = (...args) => {
    for (const server of Server.cache.values()) {
        server.stop();
    }
    console.log('Exiting...', ...args);
    process.exit();
};
process.on('exit', exit);
process.on('SIGINT', exit);
process.on('SIGUSR1', exit);
process.on('SIGUSR2', exit);
process.on('uncaughtException', exit);
process.on('SIGTERM', exit);
