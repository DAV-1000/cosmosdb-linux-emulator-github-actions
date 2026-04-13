import { CosmosClient, Database, Container } from "@azure/cosmos";
import { UserOperations, User } from "./UserOperations";
import * as https from "node:https";

describe("UserOperations", () => {
  let client: CosmosClient;
  let database: Database;
  let container: Container;

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

    client = new CosmosClient({
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
    const user: User = {
      id: `test-${Date.now()}`,
      email: testUser1,
      active: true,
    };

    await expect(UserOperations.createUserAsync(container, user)).resolves.not.toThrow();
  });

  test("should read user", async () => {
    const userId = `test-${Date.now()}`;
    const user: User = {
      id: userId,
      email: testUser2,
      active: true,
    };

    await UserOperations.createUserAsync(container, user);

    const readUser = await UserOperations.readUserAsync(container, userId);
    expect(readUser.id).toBe(userId);
    expect(readUser.email).toBe(testUser2);
    expect(readUser.active).toBe(true);
  });
});