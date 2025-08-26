import { describe, expect, test, vi } from "vitest";

describe("Preview Package Detection", () => {
  test("should detect preview tag from commit message", () => {
    // Mock execSync to return a commit with preview pattern
    const mockCommitMessage = "test: preview package [img:test-preview]";

    vi.mock("child_process", () => ({
      execSync: vi.fn().mockReturnValue(mockCommitMessage)
    }));

    // Test the pattern matching logic directly
    const match = mockCommitMessage.match(/\[img:([^\]]+)\]/);
    expect(match).toBeTruthy();
    expect(match?.[1]).toBe("test-preview");
  });

  test("should not detect preview tag from regular commit", () => {
    const regularCommitMessage = "feat: add new feature";

    const match = regularCommitMessage.match(/\[img:([^\]]+)\]/);
    expect(match).toBeNull();
  });

  test("should handle complex preview tags", () => {
    const complexCommitMessage =
      "fix: important bug fix [img:hotfix-v2.1.3-preview]";

    const match = complexCommitMessage.match(/\[img:([^\]]+)\]/);
    expect(match).toBeTruthy();
    expect(match?.[1]).toBe("hotfix-v2.1.3-preview");
  });

  test("should handle preview tag with special characters", () => {
    const specialCommitMessage =
      "feat: new feature [img:feature_x-test.preview]";

    const match = specialCommitMessage.match(/\[img:([^\]]+)\]/);
    expect(match).toBeTruthy();
    expect(match?.[1]).toBe("feature_x-test.preview");
  });
});
