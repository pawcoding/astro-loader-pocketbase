import { assert, beforeAll, describe, expect, it } from "vitest";
import { getRemoteSchema } from "../../src/schema/get-remote-schema";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderOptions } from "../_mocks/create-loader-options";

describe("getRemoteSchema", () => {
  const options = createLoaderOptions();
  let token: string;

  beforeAll(async () => {
    await checkE2eConnection();

    assert(options.superuserCredentials, "Superuser credentials are not set.");
    assert(
      !("impersonateToken" in options.superuserCredentials),
      "Impersonate token should not be used in tests."
    );

    const superuserToken = await getSuperuserToken(
      options.url,
      options.superuserCredentials
    );
    assert(superuserToken, "Superuser token should not be undefined");

    token = superuserToken;
  });

  it("should return undefined if superuser token is invalid", async () => {
    const result = await getRemoteSchema(options, "invalid-token");

    expect(result).toBeUndefined();
  });

  it("should return undefined if fetch request fails", async () => {
    const result = await getRemoteSchema(
      {
        ...options,
        collectionName: "invalidCollection"
      },
      token
    );

    expect(result).toBeUndefined();
  });

  it("should return schema if fetch request is successful", async () => {
    const result = await getRemoteSchema(
      {
        ...options,
        collectionName: "users"
      },
      token
    );

    assert(result, "Schema is not defined.");

    // Delete unstable properties (now properly typed with passthrough)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).created;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).updated;
    for (const field of result.fields) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (field as any).id;
    }

    // Delete email templates (now properly typed with passthrough)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).authAlert;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).otp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).verificationTemplate;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).resetPasswordTemplate;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).confirmEmailChangeTemplate;

    expect(result).toMatchSnapshot();
  });
});
