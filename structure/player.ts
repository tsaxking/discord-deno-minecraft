import { Server } from "./server";

export class Player {
    constructor(
        public readonly server: Server,
        public readonly username: string
    ) {}



};