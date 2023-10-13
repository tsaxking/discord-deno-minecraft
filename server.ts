import { spawn } from 'child_process';
import path from 'path';

export class Server {
    public static readonly cache: Map<string, Server> = new Map<string, Server>();

    public child?: any;

    constructor(public readonly id: string) {
    }

    get serverPath() {
        return path.resolve(__dirname, './servers', this.id);
    }


    runCommand(command: string, ...args: string[]) {
        if (this.child) {
            this.child.kill();
        }

        this.child = spawn(command, args, {
            cwd: this.serverPath,
            stdio: 'inherit'
        });

        this.child.on('exit', () => {
            this.child = undefined;
        });
    }

    start() {
        this.runCommand('java', '-jar', 'server.jar', 'nogui')
    }

    stop() {
        this.runCommand('stop');
    }
}

const exit = (...args: any[]) => {
    for (const server of Server.cache.values()) {
        server.stop();
    }

    console.log('Exiting...', ...args);

    process.exit();
}

process.on('exit', exit);
process.on('SIGINT', exit);
process.on('SIGUSR1', exit);
process.on('SIGUSR2', exit);
process.on('uncaughtException', exit);
process.on('SIGTERM', exit);
