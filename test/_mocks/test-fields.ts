import type { PocketBaseSchemaEntry } from "../../src/types/pocketbase-schema.type";

export const fields = [
  { name: "bool_field", type: "bool" },
  { name: "number_field", type: "number" },
  { name: "text_field", type: "text" },
  { name: "email_field", type: "email" },
  { name: "url_field", type: "url" },
  { name: "editor_field", type: "editor" },
  { name: "date_field", type: "date" },
  { name: "autodate_field", type: "autodate", onCreate: true },
  {
    name: "select_field",
    type: "select",
    values: ["option1", "option2"],
    maxSelect: 1
  },
  // File fields currently throw an error in the schema generation, so we'll skip them for now
  // { name: "file_field", type: "file" },
  // Relation fields do not have any special handling in the schema, so we'll skip them for now
  // { name: "relation_field", type: "relation" },
  { name: "json_field", type: "json" },
  { name: "geopoint_field", type: "geoPoint" }
] as const satisfies Array<PocketBaseSchemaEntry>;

type Entry = Record<(typeof fields)[number]["name"], unknown>;

export const rawEntry: Entry = {
  bool_field: true,
  number_field: 42,
  text_field: "Test",
  email_field: "test@pawcode.de",
  url_field: "https://pawcode.de",
  editor_field: "**bold**",
  date_field: new Date(),
  autodate_field: undefined,
  select_field: "option1",
  json_field: {},
  geopoint_field: { lon: 0, lat: 0 }
};
