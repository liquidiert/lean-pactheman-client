"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
exports.default = yargs_1.default(process.argv.slice(2))
    .option("ip", {
    type: "string",
    description: "Ip address to use",
    default: "127.0.0.1"
})
    .option("port", {
    type: "number",
    description: "Port to use",
    default: 5387
})
    .option("playername", {
    type: "string",
    description: "The name with which you will participate at a pactheman game",
    demandOption: true
})
    .option("level-count", {
    type: "number",
    description: "How many levels should be played",
    default: 5
})
    .option("game-count", {
    type: "number",
    description: "How many games should be played (game ends after all lives lost or all levels played)",
    default: 1
})
    .option("host", {
    type: "boolean",
    description: "Decide wheter to host or join a session; if not given client asks for session to join",
    default: false
})
    .argv;
