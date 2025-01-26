import { beforeAll, describe, expect, it } from "vitest";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderOptions } from "../_mocks/create-loader-options";

describe("getSuperuserToken", () => {
  const options = createLoaderOptions();

  beforeAll(async () => {
    await checkE2eConnection();
  });

  it("should return undefined if superuser credentials are invalid", async () => {
    const result = await getSuperuserToken(options.url, {
      email: "invalid",
      password: "invalid"
    });
    expect(result).toBeUndefined();
  });

  it("should return token if fetch request is successful", async () => {
    const result = await getSuperuserToken(
      options.url,
      options.superuserCredentials!
    );
    expect(result).toBeDefined();
  });
});
