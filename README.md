# astro-pocketbase-loader

This package is a simple loader to load data from a PocketBase database into Astro using the [Astro Loader API](https://5-0-0-beta.docs.astro.build/en/reference/loader-reference/) introduced in Astro 5.

## Usage

In your content configuration file, you can use the `pocketbaseLoader` function to use your PocketBase database as a data source.

```ts
import { pocketbaseLoader } from "astro-pocketbase-loader";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: pocketbaseLoader({
    url: "https://<your-pocketbase-url>",
    collectionName: "<collection-in-pocketbase>",
    content: "<field-in-collection>"
  })
});
```

By default, the loader will only fetch entries that have been modified since the last build.
Remember that due to the nature [Astros Content Layer lifecycle](https://astro.build/blog/content-layer-deep-dive#content-layer-lifecycle), the loader will **only fetch entries at build time**, even when using on-demand rendering.
If you want to update your deployed site with new entries, you need to rebuild it.

<sub>When running the dev server, you can trigger a reload by using `s + enter`.</sub>

### Type Generation

The loader can automatically generate types for your collection.
This is useful for type checking and autocompletion in your editor.
These types can be generated in two ways:

#### Remote Schema

To use the lice remote schema, you need to provide the email and password of an admin of the PocketBase instance.
Under the hood, the loader will use the [PocketBase API](https://pocketbase.io/docs/api-collections/#view-collection) to fetch the schema of your collection and generate types with Zod based on that schema.

#### Local Schema

If you don't want to provide the admin credentials (e.g. in a public repository), you can also provide the schema manually via a JSON file.
In PocketBase you can export the schema of the whole database to a `pb_schema.json` file.
If you provide the path to this file, the loader will use this schema to generate the types locally.

When admin credentials are provided, the loader will **always use the remote schema** since it's more up-to-date.

#### Manual Schema

If you don't want to use the automatic type generation, you can also [provide your own schema manually](https://5-0-0-beta.docs.astro.build/en/guides/content-collections/#defining-the-collection-schema).
This manual schema will **always override the automatic type generation**.

### Private Collections

If you want to access a private collection, you also need to provide the admin credentials.
Otherwise, you need to make the collection public in the PocketBase dashboard.

### Options

| Option           | Type                      | Required | Description                                                                                                                         |
| ---------------- | ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | `string`                  | x        | The URL of your PocketBase instance.                                                                                                |
| `collectionName` | `string`                  | x        | The name of the collection in your PocketBase instance.                                                                             |
| `content`        | `string \| Array<string>` | x        | The field in the collection to use as content. This can also be an array of fields.                                                 |
| `adminEmail`     | `string`                  |          | The email of the admin of the PocketBase instance. This is used for automatic type generation and access to private collections.    |
| `adminPassword`  | `string`                  |          | The password of the admin of the PocketBase instance. This is used for automatic type generation and access to private collections. |
| `localSchema`    | `string`                  |          | The path to a local schema file. This is used for automatic type generation.                                                        |
| `forceUpdate`    | `boolean`                 |          | If set to `true`, the loader will fetch every entry instead of only the ones modified since the last build.                         |
