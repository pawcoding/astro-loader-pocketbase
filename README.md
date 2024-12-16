# astro-loader-pocketbase

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/pawcoding/astro-loader-pocketbase/release.yaml?style=flat-square)
[![NPM Version](https://img.shields.io/npm/v/astro-loader-pocketbase?style=flat-square)](https://www.npmjs.com/package/astro-loader-pocketbase)
[![NPM Downloads](https://img.shields.io/npm/dw/astro-loader-pocketbase?style=flat-square)](https://www.npmjs.com/package/astro-loader-pocketbase)
[![GitHub License](https://img.shields.io/github/license/pawcoding/astro-loader-pocketbase?style=flat-square)](https://github.com/pawcoding/astro-loader-pocketbase/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/484669557747875862?style=flat-square&label=Discord)](https://discord.gg/GzgTh4hxrx)

This package is a simple loader to load data from a PocketBase database into Astro using the [Astro Loader API](https://docs.astro.build/en/reference/content-loader-reference/) introduced in Astro 5.

> [!TIP]
> If you want to see the PocketBase data directly in your Astro toolbar, try the [`astro-integration-pocketbase`](https://github.com/pawcoding/astro-integration-pocketbase).

## Compatibility

| Loader | Astro | PocketBase |
| ------ | ----- | ---------- |
| 1.0.0  | 5.0.0 | <= 0.22.0  |

## Basic usage

In your content configuration file, you can use the `pocketbaseLoader` function to use your PocketBase database as a data source.

```ts
import { pocketbaseLoader } from "astro-loader-pocketbase";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: pocketbaseLoader({
    url: "https://<your-pocketbase-url>",
    collectionName: "<collection-in-pocketbase>"
  })
});

export const collections = { blog };
```

By default, the loader will only fetch entries that have been modified since the last build.
Remember that due to the nature [Astros Content Layer lifecycle](https://astro.build/blog/content-layer-deep-dive#content-layer-lifecycle), the loader will **only fetch entries at build time**, even when using on-demand rendering.
If you want to update your deployed site with new entries, you need to rebuild it.

<sub>When running the dev server, you can trigger a reload by using `s + enter`.</sub>

## Entries

After generating the schema (see below), the loader will automatically parse the content of the entries (e.g. transform ISO dates to `Date` objects, coerce numbers, etc.).

### HTML content

You can also specify a field or an array of fields to use as content.
This content will then be used when calling the `render` function of [Astros content collections](https://docs.astro.build/en/guides/content-collections/#rendering-body-content).

```ts
const blog = defineCollection({
  loader: pocketbaseLoader({
    ...options,
    content: "<field-in-collection>"
  })
});
```

Since the goal of the `render` function is to render the content as HTML, it's recommended to use a field of type `editor` (rich text) in PocketBase as content.

If you specify an array of fields, the loader will wrap the content of these fields in a `<section>` and concatenate them.

### Images and files

PocketBase can store images and files for each entry in a collection.
While the API only returns the filenames of these images and files, the loader will out of the box **transform these filenames to the actual URLs** of the files.
This doesn't mean that the files are downloaded during the build process.
But you can directly use these URLs in your Astro components to display images or link to the files.

### Custom ids

By default, the loader will use the `id` field of the collection as the unique identifier.
If you want to use another field as the id, e.g. a slug of the title, you can specify this field via the `id` option.

```ts
const blog = defineCollection({
  loader: pocketbaseLoader({
    ...options,
    id: "<field-in-collection>"
  })
});
```

Please note that the id should be unique for every entry in the collection.
The loader will also automatically convert the value into a slug to be easily used in URLs.
It's recommended to use e.g. the title of the entry to be easily searchable and readable.
**Do not use e.g. rich text fields as ids.**

## Type generation

The loader can automatically generate types for your collection.
This is useful for type checking and autocompletion in your editor.
These types can be generated in two ways:

### Remote schema

To use the lice remote schema, you need to provide the email and password of an admin of the PocketBase instance.

```ts
const blog = defineCollection({
  loader: pocketbaseLoader({
    ...options,
    adminEmail: "<admin-email>",
    adminPassword: "<admin-password>"
  })
});
```

Under the hood, the loader will use the [PocketBase API](https://pocketbase.io/docs/api-collections/#view-collection) to fetch the schema of your collection and generate types with Zod based on that schema.

### Local schema

If you don't want to provide the admin credentials (e.g. in a public repository), you can also provide the schema manually via a JSON file.

```ts
const blog = defineCollection({
  loader: pocketbaseLoader({
    ...options,
    localSchema: "<path-to-schema-file>"
  })
});
```

In PocketBase you can export the schema of the whole database to a `pb_schema.json` file.
If you provide the path to this file, the loader will use this schema to generate the types locally.

When admin credentials are provided, the loader will **always use the remote schema** since it's more up-to-date.

### Manual schema

If you don't want to use the automatic type generation, you can also [provide your own schema manually](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema).
This manual schema will **always override the automatic type generation**.

## All options

| Option           | Type                          | Required | Description                                                                                                                         |
| ---------------- | ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | `string`                      | x        | The URL of your PocketBase instance.                                                                                                |
| `collectionName` | `string`                      | x        | The name of the collection in your PocketBase instance.                                                                             |
| `content`        | `string \| Array<string>`     |          | The field in the collection to use as content. This can also be an array of fields.                                                 |
| `adminEmail`     | `string`                      |          | The email of the admin of the PocketBase instance. This is used for automatic type generation and access to private collections.    |
| `adminPassword`  | `string`                      |          | The password of the admin of the PocketBase instance. This is used for automatic type generation and access to private collections. |
| `id`             | `string`                      |          | The field in the collection to use as unique id. Defaults to `id`.                                                                  |
| `localSchema`    | `string`                      |          | The path to a local schema file. This is used for automatic type generation.                                                        |
| `jsonSchemas`    | `Record<string, z.ZodSchema>` |          | A record of Zod schemas to use for type generation of `json` fields.                                                                |
| `forceUpdate`    | `boolean`                     |          | If set to `true`, the loader will fetch every entry instead of only the ones modified since the last build.                         |

## Special cases

### Private collections

If you want to access a private collection, you also need to provide the admin credentials.
Otherwise, you need to make the collection public in the PocketBase dashboard.

Generally, it's not recommended to use private collections, especially when users should be able to see images or other files stored in the collection.

### View collections

Out of the box, the loader also supports collections with the type `view`, though with some limitations.
To enable incremental builds, the loader needs to know when an entry has been modified.
Normal `base` collections have a `updated` field that is automatically updated when an entry is modified.
Thus, `view` collections that don't include this field can't be incrementally built but will be fetched every time.

You can also alias another field as `updated` (as long as it's a date field) in your view.
While this is possible, it's not recommended since it can lead to outdated data not being fetched.

### JSON fields

PocketBase can store arbitrary JSON data in a `json` field.
While this data is checked to be valid JSON, there's no schema attached or enforced.
Theoretically, every entry in a collection can have a different structure in such a field.
This is why by default the loader will treat these fields as `unknown` and will not generate types for them.

If you have your own schema for these fields, you can provide them via the `jsonSchemas` option.
The keys of this record should be the field names of your json fields, while the values are Zod schemas.
This way, the loader will also generate types for these fields and **validate the data against these schemas**.
So be sure that the schema is correct, up-to-date and all entries in the collection adhere to it.
