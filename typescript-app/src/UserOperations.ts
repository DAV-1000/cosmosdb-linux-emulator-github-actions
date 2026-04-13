import { Container, ItemResponse } from "@azure/cosmos";

export interface User {
  id: string;
  email: string;
  active: boolean;
}

export class UserOperations {
  static async createUserAsync(container: Container, user: User): Promise<void> {
    try {
      const response: ItemResponse<User> = await container.items.create(user);
      console.log("Created user:", response.resource);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async readUserAsync(container: Container, userId: string): Promise<User> {
    try {
      const response: ItemResponse<User> = await container.item(userId, userId).read();
      if (!response.resource) {
        throw new Error(`User with id ${userId} not found`);
  }
      return response.resource;
    } catch (error) {
      console.error("Error reading user:", error);
      throw error;
    }
  }
}