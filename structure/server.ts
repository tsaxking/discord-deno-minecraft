import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

type RetrieveTest = (data: string) => boolean;
type RetrieveReturnType<T> = (data: string) => T;

type Retrieve<T = unknown> = {
    test: RetrieveTest;
    returnType: RetrieveReturnType<T>;
    resolve: (data: any) => void;
}

type ListenerCallback<T = any> = (data: T) => void;

type Listener = {
    test: RetrieveTest;
    callback: ListenerCallback;
}

if (!fs.existsSync(path.resolve(__dirname, '../servers'))) {
    fs.mkdirSync(path.resolve(__dirname, '../', './servers'));
}

export class Server {
    public static readonly cache: Map<string, Server> = new Map<string, Server>();

    public readonly child = spawn('bash');

    private readonly retrieveTests:  Retrieve[] = [];
    private readonly $listeners: Listener[] = [];
    private timer?: NodeJS.Timeout;

    constructor(public readonly guildId: string, public readonly name: string) {
        if (Server.cache.has(this.guildId)) {
            throw new Error('Server already exists');
        }
        Server.cache.set(this.guildId, this);

        this.createServer();

        this.runCommand('cd', this.serverPath);

        this.child.stdout.on('data', (data) => {
            this.$listeners.forEach((l) => {
                if (l.test(data.toString())) {
                    l.callback(data.toString());
                }
            });

            this.retrieveTests.forEach((retrieve) => {
                if (retrieve.test(data.toString())) {
                    retrieve.resolve(retrieve.returnType(data.toString()));
                    this.retrieveTests.splice(this.retrieveTests.indexOf(retrieve), 1);
                }
            });
            this.log(data.toString());
        });

        this.child.stderr.on('data', (data) => {
            this.log(data.toString());
        });

        this.child.on('close', (code) => {
            this.log(`Process exited with code ${code}`);
        });


        this.on((data) => data.toLowerCase().includes('join'), async (data) => {
            this.stopTimer();
        });

        this.on((data) => data.toLowerCase().includes('left the game'), async (data) => {
            const players = await this.getPlayers();
            if (players.length === 0) {
                this.startTimer();
            }
        });
    }

    createServer() {
        if (!fs.existsSync(this.serverPath)) {
            fs.mkdirSync(this.serverPath);
        }
    }

    startTimer() {
        // stop server after 30 minutes
        this.timer = setTimeout(() => {
            this.stop();
        }, 1000 * 60 * 30);
    }

    stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    get serverPath() {
        return path.resolve(__dirname, '../servers', this.guildId);
    }


    runCommand(...args: string[]) {
        this.child.stdin.write(`${args.join(' ')}\n`);
    }

    start() {
        this.runCommand('java', '-jar', '-Xmx1024M', '-Xms1024M', 'server.jar', 'nogui');
    }

    stop() {
        this.runCommand('stop');
    }

    log(data: string) {
        console.log(`[${this.guildId}] ${data}`);
    }

    async retrieve<T>(test: RetrieveTest, type: RetrieveReturnType<T>): Promise<T> {
        return new Promise((resolve) => {
            this.retrieveTests.push({
                test,
                returnType: type,
                resolve
            });
        });
    }

    async getPlayers(): Promise<string[]> {
        return this.retrieve<string[]>(
                (data) => data.includes('players online:'),
                (data) => data.split(':')[1].split(',').map((player) => player.trim())
            );
    }

    on(event: RetrieveTest, callback: ListenerCallback<string>) {
        this.$listeners.push({
            test: event,
            callback
        });
    }

    backup() {}
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
