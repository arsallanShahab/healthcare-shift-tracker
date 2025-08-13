import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.GRAPHQL_ENDPOINT || "/api/graphql",
  credentials: "same-origin",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  credentials: "include",
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
