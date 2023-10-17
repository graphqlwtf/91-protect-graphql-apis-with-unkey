# GraphQL Yoga + Unkey

Learn how to use the [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) Plugin system to protect requests using API keys with Unkey in this [video tutorial](https://graphql.wtf/episodes/91-protect-graphql-apis-with-unkey).

## Usage

Create the following custom `useUnkey` plugin:

```ts
function useUnkey(): Plugin {
  return {
    async onRequestParse({ request }) {
      const token = request.headers.get("x-unkey-api-key") as string;

      if (!token) {
        throw createGraphQLError("No API Key provided");
      }

      const { result, error } = await verifyKey(token);

      if (error) {
        throw createGraphQLError(error.message);
      }

      if (!result.valid) {
        throw createGraphQLError("API Key is not valid for this request");
      }
    },
  };
}
```

Now invoke `useUnkey()` and pass it to the Yoga `plugins`:

```ts
import { createYoga, createGraphQLError, type Plugin } from "graphql-yoga";
import { verifyKey } from "@unkey/api";

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => "world",
    },
  },
});

const yoga = createYoga({ schema, plugins: [useUnkey()] });

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
```

That's it! Make sure to pass your API key (provided by Unkey) for the header `x-unkey-api-key` with GraphQL requests.
