import AuthProvider from "@/components/AuthProvider";
import DropboxButton from "@/components/DropboxButton";
import { H1 } from "@expo/html-elements";
import {
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from "expo-auth-session";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

function useDropboxAuth() {
  const { setAsync } = React.useContext(AuthProvider.Context);

  // Endpoint
  const discovery = {
    authorizationEndpoint: "https://www.dropbox.com/oauth2/authorize",
    tokenEndpoint: "https://www.dropbox.com/oauth2/token",
  };
  // Request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "v4do7f6fn731h96",
      // There are no scopes so just pass an empty array
      scopes: [],
      extraParams: {
        force_reapprove: "true",
      },
      // Dropbox doesn't support PKCE
      usePKCE: false,
      // Implicit auth is universal, `.Code` will only work in native with `useProxy: true`.
      responseType: ResponseType.Token,
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        preferLocalhost: true,
        path: "redirect",
        // For usage in bare and standalone
        native: "com.bacon.dropbox://redirect",
      }),
    },
    discovery
  );
  console.log(request?.redirectUri);

  React.useEffect(() => {
    if (response?.type === "success") {
      setAsync(response.params.access_token);
      // Navigate after signing in. You may want to tweak this to ensure sign-in is
      // successful before navigating.
      router.replace("/");
    }
  }, [response]);

  return [request, response, promptAsync] as const;
}

export default function SignInScreen() {
  const [request, res, promptAsync] = useDropboxAuth();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    setLoading(false);
  }, [res]);

  return (
    <View style={styles.container}>
      <H1>Expo Dropbox Auth</H1>
      <DropboxButton
        disabled={!request}
        onPress={() => {
          setLoading(true);
          promptAsync();
        }}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
