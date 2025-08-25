import { describe, expect, it } from "vitest";
import { combineFieldsForRequest } from "../../src/utils/combine-fields-for-request";

describe("combineFieldsForRequest", () => {
  const defaultOptions = {
    idField: undefined,
    updatedField: undefined,
    contentFields: undefined
  };

  describe("when no user fields are provided", () => {
    it("should return undefined for undefined input", () => {
      const result = combineFieldsForRequest(undefined, defaultOptions);
      expect(result).toBeUndefined();
    });
  });

  describe("when user fields are provided", () => {
    it("should combine basic and user fields without hardcoded special fields", () => {
      const userFields = ["title", "content"];
      const result = combineFieldsForRequest(userFields, defaultOptions);

      expect(result).toContain("id");
      expect(result).toContain("collectionId");
      expect(result).toContain("collectionName");
      expect(result).toContain("title");
      expect(result).toContain("content");
      // Should not contain hardcoded special fields
      expect(result).not.toContain("created");
      expect(result).not.toContain("updated");
    });

    it("should include custom option fields when specified", () => {
      const userFields = ["title", "content"];
      const options = {
        idField: "custom_id",
        updatedField: "modified_at",
        contentFields: ["description", "body"]
      };
      const result = combineFieldsForRequest(userFields, options);

      expect(result).toContain("id");
      expect(result).toContain("collectionId");
      expect(result).toContain("collectionName");
      expect(result).toContain("custom_id");
      expect(result).toContain("modified_at");
      expect(result).toContain("description");
      expect(result).toContain("body");
      expect(result).toContain("title");
      expect(result).toContain("content");
    });

    it("should handle single content field as string", () => {
      const userFields = ["title"];
      const options = {
        idField: undefined,
        updatedField: "updated",
        contentFields: "content"
      };
      const result = combineFieldsForRequest(userFields, options);

      expect(result).toContain("updated");
      expect(result).toContain("content");
      expect(result).toContain("title");
    });

    it("should not duplicate id field when custom idField is 'id'", () => {
      const userFields = ["title"];
      const options = {
        idField: "id",
        updatedField: undefined,
        contentFields: undefined
      };
      const result = combineFieldsForRequest(userFields, options);

      const idCount = result?.filter((field) => field === "id").length;
      expect(idCount).toBe(1);
    });

    it("should remove duplicates when user fields overlap with system fields", () => {
      const userFields = ["id", "title", "collectionId", "content"];
      const result = combineFieldsForRequest(userFields, defaultOptions);

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
      const result = combineFieldsForRequest(userFields, defaultOptions);

      expect(result).toContain("id");
      expect(result).toContain("collectionId");
      expect(result).toContain("collectionName");
      expect(result).toHaveLength(3); // Only basic fields
    });

    it("should preserve special field syntax like excerpt", () => {
      const userFields = ["title", "description:excerpt(200,true)"];
      const result = combineFieldsForRequest(userFields, defaultOptions);

      expect(result).toContain("description:excerpt(200,true)");
      expect(result).toContain("title");
      expect(result).toContain("id");
    });
  });
});
