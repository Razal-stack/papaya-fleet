import { describe, expect, it } from "vitest";
import { camelToSnakeObject, snakeToCamelObject } from "../transformers";

describe("Object Transformers", () => {
  describe("snakeToCamelObject", () => {
    it("should transform snake_case keys to camelCase", () => {
      const input = {
        first_name: "John",
        last_name: "Doe",
        employee_id: "EMP-123",
        hire_date: "2023-01-01",
        is_active: true,
      };

      const expected = {
        firstName: "John",
        lastName: "Doe",
        employeeId: "EMP-123",
        hireDate: "2023-01-01",
        isActive: true,
      };

      expect(snakeToCamelObject(input)).toEqual(expected);
    });

    it("should handle nested objects", () => {
      const input = {
        user_info: {
          first_name: "John",
          last_name: "Doe",
        },
        contact_details: {
          phone_number: "555-1234",
        },
      };

      const expected = {
        userInfo: {
          firstName: "John",
          lastName: "Doe",
        },
        contactDetails: {
          phoneNumber: "555-1234",
        },
      };

      expect(snakeToCamelObject(input)).toEqual(expected);
    });

    it("should handle arrays", () => {
      const input = {
        user_list: [
          { first_name: "John" },
          { first_name: "Jane" },
        ],
      };

      const expected = {
        userList: [
          { firstName: "John" },
          { firstName: "Jane" },
        ],
      };

      expect(snakeToCamelObject(input)).toEqual(expected);
    });

    it("should handle null and undefined values", () => {
      expect(snakeToCamelObject(null)).toBeNull();
      expect(snakeToCamelObject(undefined)).toBeUndefined();
    });
  });

  describe("camelToSnakeObject", () => {
    it("should transform camelCase keys to snake_case", () => {
      const input = {
        firstName: "John",
        lastName: "Doe",
        employeeId: "EMP-123",
        hireDate: "2023-01-01",
        isActive: true,
      };

      const expected = {
        first_name: "John",
        last_name: "Doe",
        employee_id: "EMP-123",
        hire_date: "2023-01-01",
        is_active: true,
      };

      expect(camelToSnakeObject(input)).toEqual(expected);
    });

    it("should handle nested objects", () => {
      const input = {
        userInfo: {
          firstName: "John",
          lastName: "Doe",
        },
        contactDetails: {
          phoneNumber: "555-1234",
        },
      };

      const expected = {
        user_info: {
          first_name: "John",
          last_name: "Doe",
        },
        contact_details: {
          phone_number: "555-1234",
        },
      };

      expect(camelToSnakeObject(input)).toEqual(expected);
    });

    it("should handle arrays", () => {
      const input = {
        userList: [
          { firstName: "John" },
          { firstName: "Jane" },
        ],
      };

      const expected = {
        user_list: [
          { first_name: "John" },
          { first_name: "Jane" },
        ],
      };

      expect(camelToSnakeObject(input)).toEqual(expected);
    });

    it("should handle null and undefined values", () => {
      expect(camelToSnakeObject(null)).toBeNull();
      expect(camelToSnakeObject(undefined)).toBeUndefined();
    });
  });
});