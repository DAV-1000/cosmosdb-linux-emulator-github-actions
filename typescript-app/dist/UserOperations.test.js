"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const cosmos_1 = require("@azure/cosmos");
const UserOperations_1 = require("./UserOperations");
const https = __importStar(require("node:https"));
describe("UserOperations", () => {
    let client;
    let database;
    let container;
    beforeAll(async () => {
        const connectionString = process.env.COSMOSDB_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("COSMOSDB_CONNECTION_STRING environment variable is not set.");
        }
        const databaseName = process.env.COSMOSDB_DATABASE_NAME;
        if (!databaseName) {
            throw new Error("COSMOSDB_DATABASE_NAME environment variable is not set.");
        }
        const containerName = process.env.COSMOSDB_CONTAINER_NAME;
        if (!containerName) {
            throw new Error("COSMOSDB_CONTAINER_NAME environment variable is not set.");
        }
        const httpsConnectionString = connectionString.replace("http://", "https://");
        client = new cosmos_1.CosmosClient({
            endpoint: httpsConnectionString.split(";")[0].split("=")[1],
            key: httpsConnectionString.split(";")[1].split("=")[1],
            agent: new https.Agent({
                rejectUnauthorized: false, // Accept self-signed cert for emulator
            }),
        });
        database = (await client.databases.createIfNotExists({ id: databaseName })).database;
        container = (await database.containers.createIfNotExists({ id: containerName, partitionKey: "/id" })).container;
        console.log("Database created:", database.id);
        console.log("Container created:", container.id);
    });
    afterAll(async () => {
        if (database) {
            await database.delete();
            console.log("Deleted database:", database.id);
        }
        client.dispose();
    });
    const testUser1 = "user42@example.com";
    const testUser2 = "user43@example.com";
    test("should create user", async () => {
        const user = {
            id: `test-${Date.now()}`,
            email: testUser1,
            active: true,
        };
        await expect(UserOperations_1.UserOperations.createUserAsync(container, user)).resolves.not.toThrow();
    });
    test("should read user", async () => {
        const userId = `test-${Date.now()}`;
        const user = {
            id: userId,
            email: testUser2,
            active: true,
        };
        await UserOperations_1.UserOperations.createUserAsync(container, user);
        const readUser = await UserOperations_1.UserOperations.readUserAsync(container, userId);
        expect(readUser.id).toBe(userId);
        expect(readUser.email).toBe(testUser2);
        expect(readUser.active).toBe(true);
    });
});
