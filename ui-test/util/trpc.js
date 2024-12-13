// import { createTRPCProxyClient, httpLink } from "@trpc/client";
// import superjson from "superjson";
const { createTRPCProxyClient, httpLink } = require('@trpc/client');
// const superjson = require('superjson');

async function getTrpcClient(token) {
  const superjson = (await import('superjson')).default;
  return createTRPCProxyClient({
    links: [
      httpLink({
        url: "https://api.recipesage.com/trpc",
        headers: () => {
          return {
            Authorization: token ? `Bearer ${token}` : undefined,
          };
        },
      }),
    ],
    transformer: superjson,
  });
}

module.exports = { getTrpcClient };
