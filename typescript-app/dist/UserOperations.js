"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOperations = void 0;
class UserOperations {
    static async createUserAsync(container, user) {
        try {
            const response = await container.items.create(user);
            console.log("Created user:", response.resource);
        }
        catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }
    static async readUserAsync(container, userId) {
        try {
            const response = await container.item(userId, userId).read();
            if (!response.resource) {
                throw new Error(`User with id ${userId} not found`);
            }
            return response.resource;
        }
        catch (error) {
            console.error("Error reading user:", error);
            throw error;
        }
    }
}
exports.UserOperations = UserOperations;
