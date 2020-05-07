import React from "react";
import { StyleSheet, Button, Text, View } from "react-native";
import {
  useAuthRequest,
  ResponseType,
  makeRedirectUri,
} from "expo-auth-session";

import { maybeCompleteAuthSession } from "expo-web-browser";

maybeCompleteAuthSession();

import { Dropbox } from "dropbox";
import AuthProvider from "./AuthProvider";

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
      clientId: "pwad5frda4h3xy0",
      // There are no scopes so just pass an empty array
      scopes: [],
      // Dropbox doesn't support PKCE
      usePKCE: false,
      // Implicit auth is universal, `.Code` will only work in native with `useProxy: true`.
      responseType: ResponseType.Token,
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: "com.bacon.dropbox://redirect",
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      setAsync(response.params.access_token);
    }
  }, [response]);

  return [request, response, promptAsync];
}

function LoginApp() {
  const [request, res, promptAsync] = useDropboxAuth();

  return (
    <View style={styles.container}>
      <Text>Login to Dropbox</Text>
      <Button
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
        title="Login"
      />
    </View>
  );
}

function MainApp({ accessToken }: any) {
  const [dropbox, setDropbox] = React.useState<any>(null);

  React.useEffect(() => {
    console.log("Signed in: ", accessToken);
    const dropbox = new Dropbox({
      fetch,
      accessToken,
    });

    setDropbox(dropbox);
  }, [accessToken]);

  return (
    <View style={styles.container}>
      <Text>Welcome</Text>
      <Button
        onPress={async () => {
          if (dropbox) {
            let filesCommitInfo = {
              contents: JSON.stringify({ white: "claw" }),
              path: "/transactions.json",
              mode: {
                ".tag": "overwrite",
              } as DropboxTypes.files.WriteModeOverwrite,
              autorename: false,
              mute: false,
            };
            try {
              const metadata = await dropbox.filesUpload(filesCommitInfo);
              console.log(metadata);
            } catch (error) {
              console.info(`settings.json write failed. ${error}`);
            }
          }
        }}
        title="Write"
      />
      <Button
        onPress={async () => {
          if (dropbox) {
            const res = await dropbox.filesListFolder({ path: "" });
            console.log(res);
          }
        }}
        title="Read"
      />
    </View>
  );
}

function SwitchApp() {
  const { isLoaded, value } = React.useContext(AuthProvider.Context);

  if (!isLoaded) {
    return <View />;
  }
  if (value) {
    return <MainApp accessToken={value} />;
  }
  return <LoginApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <SwitchApp />
    </AuthProvider>
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
