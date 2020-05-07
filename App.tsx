import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Dropbox } from "dropbox";
import {
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from "expo-auth-session";
import { maybeCompleteAuthSession } from "expo-web-browser";
import React from "react";
import {
  Button,
  StyleSheet,
  Dimensions,
  ScaledSize,
  Text,
  View,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { H1, B } from "@expo/html-elements";

import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import AuthProvider from "./AuthProvider";
import { TouchableOpacity } from "react-native-gesture-handler";

maybeCompleteAuthSession();

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

function SignInScreen() {
  const [request, res, promptAsync] = useDropboxAuth();

  return (
    <View style={styles.container}>
      <H1>Welcome to uploader</H1>
      <AntDesign.Button
        name="dropbox"
        size={24}
        color="white"
        onPress={() => {
          promptAsync();
        }}
      >
        <B style={{ fontSize: 16, color: "white" }}>Login with Dropbox</B>
      </AntDesign.Button>
    </View>
  );
}

function HomeScreen() {
  const [dropbox, setDropbox] = React.useState<any>(null);
  const { value: accessToken } = React.useContext(AuthProvider.Context);

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

function DrawerButton({ onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <MaterialIcons size={24} name="menu" color="black"></MaterialIcons>
    </TouchableOpacity>
  );
}

function SwitchApp() {
  const { isLoaded, setAsync, value } = React.useContext(AuthProvider.Context);

  const [dimensions, setDimensions] = React.useState(Dimensions.get("window"));

  React.useEffect(() => {
    const onDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    Dimensions.addEventListener("change", onDimensionsChange);

    return () => Dimensions.removeEventListener("change", onDimensionsChange);
  }, []);

  if (!isLoaded) {
    return <View />;
  }

  const isLargeScreen = dimensions.width >= 1024;

  return (
    <Drawer.Navigator drawerType={isLargeScreen ? "permanent" : undefined}>
      <Drawer.Screen
        name="Dropbox Demo"
        options={{
          drawerIcon: ({ size, color }) => (
            <MaterialIcons size={size} color={color} name="folder" />
          ),
        }}
      >
        {({ navigation }) => (
          <Stack.Navigator>
            {value == null ? (
              // No token found, user isn't signed in
              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{
                  title: "Sign in",
                  // When logging out, a pop animation feels intuitive
                  // You can remove this if you want the default 'push' animation
                  // animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                  headerLeft: isLargeScreen
                    ? undefined
                    : () => (
                        <DrawerButton
                          onPress={() => navigation.toggleDrawer()}
                        />
                      ),
                }}
              />
            ) : (
              // User is signed in
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerRightContainerStyle: {
                    marginRight: 12,
                  },
                  headerRight: () => (
                    <Button
                      title="Sign Out"
                      onPress={() => setAsync(null)}
                      color={"blue"}
                    />
                  ),
                  headerLeft: isLargeScreen
                    ? undefined
                    : () => (
                        <DrawerButton
                          onPress={() => navigation.toggleDrawer()}
                        />
                      ),
                }}
              />
            )}
          </Stack.Navigator>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <SwitchApp />
      </AuthProvider>
    </NavigationContainer>
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
