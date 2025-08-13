import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
// import { getSession } from "@auth0/nextjs-auth0/server";
import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";
import { resolvers } from "../../../lib/graphql/resolvers";
import { typeDefs } from "../../../lib/graphql/schema";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable GraphQL Playground in development
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    try {
      console.log("GraphQL context - getting session...");
      const session = await auth0.getSession(req);
      console.log(
        "GraphQL context - session:",
        session ? "Found" : "Not found"
      );
      if (session?.user) {
        console.log("GraphQL context - user sub:", session.user.sub);
      }
      return {
        user: session?.user || null,
      };
    } catch (error) {
      console.error("Error getting session in GraphQL context:", error);
      return {
        user: null,
      };
    }
  },
});

export { handler as GET, handler as POST };
