import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTokenPromise } from "../../src/utils/create-token-promise";

vi.mock("../../src/utils/get-superuser-token");

describe("createTokenPromise", async () => {
  const superuserToken = "superuser-token";

  const gst = await import("../../src/utils/get-superuser-token");

  beforeEach(() => {
    gst.getSuperuserToken = vi.fn().mockResolvedValue(superuserToken);
  });

  it("should return impersonate token when provided", async () => {
    const impersonateToken = "impersonate-token";

    const token = await createTokenPromise({
      superuserCredentials: { impersonateToken },
      url: "doesnt-matter"
    });

    expect(token).toBe(impersonateToken);
    expect(gst.getSuperuserToken).not.toHaveBeenCalled();
  });

  it("should return superuser token when email and password are provided", async () => {
    const token = await createTokenPromise({
      superuserCredentials: {
        email: "doesnt-matter",
        password: "doesnt-matter"
      },
      url: "doesnt-matter"
    });

    expect(token).toBe(superuserToken);
    expect(gst.getSuperuserToken).toHaveBeenCalledWith("doesnt-matter", {
      email: "doesnt-matter",
      password: "doesnt-matter"
    });
  });

  it("should return undefined when no credentials are provided", async () => {
    const token = await createTokenPromise({
      url: "doesnt-matter"
    });

    expect(token).toBeUndefined();
    expect(gst.getSuperuserToken).not.toHaveBeenCalled();
  });
});
