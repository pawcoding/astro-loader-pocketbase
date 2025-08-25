import { describe, expect, it } from "vitest";
import { combineFieldsForRequest } from "../../src/utils/combine-fields-for-request";

describe("combineFieldsForRequest", () => {
  describe("when no user fields are provided", () => {
    it("should return undefined for undefined input", () => {
      const result = combineFieldsForRequest(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("when user fields are provided", () => {
    it("should combine basic, special, and user fields", () => {
      const userFields = ["title", "content"];
      const result = combineFieldsForRequest(userFields);

      expect(result).toContain("id");
      expect(result).toContain("collectionId");
      expect(result).toContain("collectionName");
      expect(result).toContain("created");
      expect(result).toContain("updated");
      expect(result).toContain("title");
      expect(result).toContain("content");
    });

    it("should remove duplicates when user fields overlap with system fields", () => {
      const userFields = ["id", "title", "collectionId", "content"];
      const result = combineFieldsForRequest(userFields);

      // Count occurrences of "id" - should only appear once
      const idCount = result?.filter((field) => field === "id").length;
      expect(idCount).toBe(1);

      // Count occurrences of "collectionId" - should only appear once
      const collectionIdCount = result?.filter(
        (field) => field === "collectionId"
      ).length;
      expect(collectionIdCount).toBe(1);
    });

    it("should handle empty user fields array", () => {
      const userFields: Array<string> = [];
      const result = combineFieldsForRequest(userFields);

      expect(result).toContain("id");
      expect(result).toContain("collectionId");
      expect(result).toContain("collectionName");
      expect(result).toContain("created");
      expect(result).toContain("updated");
      expect(result).toHaveLength(5); // Only basic + special fields
    });

    it("should preserve special field syntax like excerpt", () => {
      const userFields = ["title", "description:excerpt(200,true)"];
      const result = combineFieldsForRequest(userFields);

      expect(result).toContain("description:excerpt(200,true)");
      expect(result).toContain("title");
      expect(result).toContain("id");
    });
  });
});
