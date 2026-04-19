import { z } from "astro/zod";
import { describe, expect, test } from "vitest";
import { generateType } from "../../src/schema/generate-type";

describe("generateType", () => {
  test("should generate typescript type for complex entry", () => {
    const schema = z.object({
      age: z.number(),
      isAdult: z.boolean().meta({
        id: "isAdult",
        name: "isAdult",
        description: "Indicates if the person is an adult"
      }),
      birthday: z.coerce.date(),
      location: z.object({
        lon: z.number(),
        lat: z.number()
      }),
      sex: z.enum(["male", "female"]),
      name: z.string(),
      avatars: z.array(z.string()),
      nickname: z.optional(z.string())
    });

    const type = generateType(schema);
    expect(type).toMatchSnapshot();
  });

  test("should generate typescript type for transformed entry", () => {
    const schema = z.object({
      age: z.number(),
      isAdult: z.boolean().meta({
        id: "isAdult",
        name: "isAdult",
        description: "Indicates if the person is an adult"
      }),
      location: z.object({
        lon: z.number(),
        lat: z.number()
      })
    });
    const transformedSchema = schema.transform((entry) => ({
      ...entry,
      isAdult: entry.age >= 18
    }));

    const type = generateType(transformedSchema);
    expect(type).toMatchSnapshot();
  });
});
