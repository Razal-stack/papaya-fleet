import { describe, expect, it } from "vitest";

describe("Filter Test", () => {
  it("should perform case-insensitive filtering", () => {
    // Simulate the fuzzy filter function
    const fuzzyFilter = (value: any, filterValue: any) => {
      if (value == null) return false;
      return String(value).toLowerCase() === String(filterValue).toLowerCase();
    };

    // Test data with different casing
    const testCases = [
      { value: "ACTIVE", filter: "active", expected: true },
      { value: "active", filter: "ACTIVE", expected: true },
      { value: "Active", filter: "active", expected: true },
      { value: "inactive", filter: "active", expected: false },
      { value: "INACTIVE", filter: "active", expected: false },
      { value: "maintenance", filter: "MAINTENANCE", expected: true },
      { value: "REPAIR", filter: "repair", expected: true },
    ];

    testCases.forEach(({ value, filter, expected }) => {
      const result = fuzzyFilter(value, filter);
      expect(result).toBe(expected);
    });
  });

  it("should handle null and undefined values", () => {
    const fuzzyFilter = (value: any, filterValue: any) => {
      if (value == null) return false;
      return String(value).toLowerCase() === String(filterValue).toLowerCase();
    };

    expect(fuzzyFilter(null, "active")).toBe(false);
    expect(fuzzyFilter(undefined, "active")).toBe(false);
    expect(fuzzyFilter("", "active")).toBe(false);
  });
});
