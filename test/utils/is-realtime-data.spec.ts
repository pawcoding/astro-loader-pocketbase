import { assert, describe, test } from "vitest";
import { isRealtimeData } from "../../src/utils/is-realtime-data";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

describe("isRealtimeData", () => {
  test("should return true for valid create action", () => {
    const data = {
      action: "create",
      record: createPocketbaseEntry()
    };

    assert(isRealtimeData(data));
  });

  test("should return true for valid update action", () => {
    const data = {
      action: "update",
      record: createPocketbaseEntry()
    };

    assert(isRealtimeData(data));
  });

  test("should return true for valid delete action", () => {
    const data = {
      action: "delete",
      record: createPocketbaseEntry()
    };

    assert(isRealtimeData(data));
  });

  test("should return false for invalid action", () => {
    const data = {
      action: "invalid",
      record: createPocketbaseEntry()
    };

    assert(!isRealtimeData(data));
  });

  test("should return false for missing record", () => {
    const data = {
      action: "create"
    };

    assert(!isRealtimeData(data));
  });

  test("should return false for missing action", () => {
    const data = {
      record: createPocketbaseEntry()
    };

    assert(!isRealtimeData(data));
  });

  test("should return false for invalid record structure", () => {
    const record = createPocketbaseEntry();
    // @ts-expect-error - collectionId is required
    delete record.collectionId;

    const data = {
      action: "create",
      record: record
    };

    assert(!isRealtimeData(data));
  });

  test("should return false for completely invalid data", () => {
    const data = {
      foo: "bar"
    };

    assert(!isRealtimeData(data));
  });
});
