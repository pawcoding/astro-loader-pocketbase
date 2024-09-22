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

### Type Generation

The loader can automatically generate types for your collection.
To do this, you need to provide the email and password of an admin of the PocketBase instance.
Under the hood, the loader will use the [PocketBase API](https://pocketbase.io/docs/api-collections/#view-collection) to fetch the schema of your collection and generate types with Zod based on that schema.

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
| `forceUpdate`    | `boolean`                 |          | If set to `true`, the loader will fetch every entry instead of only the ones modified since the last build.                         |
