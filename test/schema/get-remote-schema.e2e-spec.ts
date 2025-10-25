import { assert, describe, expect, inject, it } from "vitest";
import { getRemoteSchema } from "../../src/schema/get-remote-schema";
import { createLoaderOptions } from "../_mocks/create-loader-options";

describe("getRemoteSchema", () => {
  const options = createLoaderOptions();
  const token = inject("superuserToken");

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

    expect(result).toMatchSnapshot();
  });
});
