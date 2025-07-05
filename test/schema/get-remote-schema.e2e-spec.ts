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
    const result = await getRemoteSchema(
      {
        ...options,
        superuserCredentials: { email: "invalid", password: "invalid" }
      },
      "invalid-token"
    );

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

    // Delete unstable properties
    // @ts-expect-error - created is not typed
    delete result.created;
    // @ts-expect-error - updated is not typed
    delete result.updated;
    for (const field of result!.fields) {
      // @ts-expect-error - id is not typed
      delete field.id;
    }

    // Delete email templates
    // @ts-expect-error - authAlert is not typed
    delete result.authAlert;
    // @ts-expect-error - otp is not typed
    delete result.otp;
    // @ts-expect-error - verificationTemplate is not typed
    delete result.verificationTemplate;
    // @ts-expect-error - resetPasswordTemplate is not typed
    delete result.resetPasswordTemplate;
    // @ts-expect-error - confirmEmailChangeTemplate is not typed
    delete result.confirmEmailChangeTemplate;

    expect(result).toMatchSnapshot();
  });
});
