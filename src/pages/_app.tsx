import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { apolloClient } from "@/lib/apollo";
import { ApolloProvider } from "@apollo/client";
import { ConfigProvider, theme as antTheme } from "antd";
import "antd/dist/reset.css";
import type { AppProps } from "next/app";

const customTheme = {
  token: {
    colorPrimary: "#1f4e79",
    colorSuccess: "#00c781",
    colorWarning: "#ffaa15",
    colorError: "#ff4040",
    fontFamily: "Roboto, sans-serif",
    borderRadius: 6,
  },
  algorithm: antTheme.defaultAlgorithm,
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <ConfigProvider theme={customTheme}>
        <AuthProvider>
          <LocationProvider>
            <Component {...pageProps} />
          </LocationProvider>
        </AuthProvider>
      </ConfigProvider>
    </ApolloProvider>
  );
}
