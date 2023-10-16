import { createServer } from "node:http";
import {
  type Plugin,
  createSchema,
  createYoga,
  createGraphQLError,
} from "graphql-yoga";
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

const yoga = createYoga({
  schema,
  plugins: [useUnkey()],
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
