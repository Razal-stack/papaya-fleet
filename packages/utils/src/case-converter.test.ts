import { describe, expect, it } from "vitest";
import {
  camelToSnake,
  camelToSnakeObject,
  snakeToCamel,
  snakeToCamelObject,
} from "./case-converter";

describe("Case Converter", () => {
  describe("snakeToCamel", () => {
    it("converts snake_case to camelCase", () => {
      expect(snakeToCamel("hello_world")).toBe("helloWorld");
      expect(snakeToCamel("user_id")).toBe("userId");
      expect(snakeToCamel("created_at_timestamp")).toBe("createdAtTimestamp");
    });

    it("handles strings without underscores", () => {
      expect(snakeToCamel("hello")).toBe("hello");
    });
  });

  describe("camelToSnake", () => {
    it("converts camelCase to snake_case", () => {
      expect(camelToSnake("helloWorld")).toBe("hello_world");
      expect(camelToSnake("userId")).toBe("user_id");
      expect(camelToSnake("createdAtTimestamp")).toBe("created_at_timestamp");
    });

    it("handles strings without uppercase", () => {
      expect(camelToSnake("hello")).toBe("hello");
    });
  });

  describe("snakeToCamelObject", () => {
    it("converts object keys from snake_case to camelCase", () => {
      const input = {
        user_id: 1,
        user_name: "John",
        created_at: "2024-01-01",
      };

      const expected = {
        userId: 1,
        userName: "John",
        createdAt: "2024-01-01",
      };

      expect(snakeToCamelObject(input)).toEqual(expected);
    });

    it("handles nested objects", () => {
      const input = {
        user_data: {
          first_name: "John",
          last_name: "Doe",
          contact_info: {
            email_address: "john@example.com",
          },
        },
      };

      const expected = {
        userData: {
          firstName: "John",
          lastName: "Doe",
          contactInfo: {
            emailAddress: "john@example.com",
          },
        },
      };

      expect(snakeToCamelObject(input)).toEqual(expected);
    });

    it("handles arrays", () => {
      const input = [
        { user_id: 1, user_name: "John" },
        { user_id: 2, user_name: "Jane" },
      ];

      const expected = [
        { userId: 1, userName: "John" },
        { userId: 2, userName: "Jane" },
      ];

      expect(snakeToCamelObject(input)).toEqual(expected);
    });

    it("handles null and undefined", () => {
      expect(snakeToCamelObject(null)).toBeNull();
      expect(snakeToCamelObject(undefined)).toBeUndefined();
    });
  });

  describe("camelToSnakeObject", () => {
    it("converts object keys from camelCase to snake_case", () => {
      const input = {
        userId: 1,
        userName: "John",
        createdAt: "2024-01-01",
      };

      const expected = {
        user_id: 1,
        user_name: "John",
        created_at: "2024-01-01",
      };

      expect(camelToSnakeObject(input)).toEqual(expected);
    });
  });
});
