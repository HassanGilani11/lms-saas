import { EventEmitter } from "events";

// Global event emitter for the server
declare global {
    var notificationEmitter: EventEmitter | undefined;
}

export const notificationEmitter = globalThis.notificationEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
    globalThis.notificationEmitter = notificationEmitter;
}
