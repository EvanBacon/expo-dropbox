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
  StyleSheet,
  Dimensions,
  ScaledSize,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { H1, B } from "@expo/html-elements";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AuthProvider from "./AuthProvider";

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
      clientId: "v4do7f6fn731h96",
      // There are no scopes so just pass an empty array
      scopes: [],
      extraParams: {
        force_reapprove: true,
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
    }
  }, [response]);

  return [request, response, promptAsync];
}
import { useHover } from "react-native-web-hooks";
import DropboxButton from "./DropboxButton";
import DropboxIcon from "./DropboxIcon";

function SignInScreen() {
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

function IconButton({ title, style, ...props }: any) {
  const ref = React.useRef(null);
  const isHovered = useHover(ref);

  return (
    <FontAwesome.Button
      ref={ref}
      {...props}
      size={24}
      style={[
        style,
        {
          backgroundColor: DropboxIcon.color,
          ...Platform.select({
            web: { transitionDuration: "150ms" },
            default: {},
          }),
        },
        isHovered && { backgroundColor: "#0d0dc3" },
      ]}
      color="white"
    >
      <B style={{ fontSize: 16, color: "white" }}>{title}</B>
    </FontAwesome.Button>
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

  const onWrite = async () => {
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
  };
  const onRead = async () => {
    if (dropbox) {
      const res = await dropbox.filesListFolder({ path: "" });
      console.log(res);
    }
  };
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "stretch" }}>
        <View style={{ marginBottom: 8 }}>
          <IconButton
            onPress={onWrite}
            name="cloud-upload"
            title="Write Files"
          />
        </View>
        <IconButton onPress={onRead} name="list-alt" title="Read Files" />
      </View>
    </View>
  );
}

function DrawerButton({ onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <MaterialIcons size={24} name="menu" color="white"></MaterialIcons>
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

  const headerOptions = ({ navigation }: any) => ({
    headerStyle: { backgroundColor: DropboxIcon.color },
    headerTintColor: "white",
    // When logging out, a pop animation feels intuitive
    // You can remove this if you want the default 'push' animation
    // animationTypeForReplace: state.isSignout ? 'pop' : 'push',
    headerLeft: isLargeScreen
      ? undefined
      : () => <DrawerButton onPress={() => navigation.toggleDrawer()} />,
  });

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
                  ...headerOptions({ navigation }),
                  title: "Sign in",
                }}
              />
            ) : (
              // User is signed in
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  ...headerOptions({ navigation }),
                  headerRightContainerStyle: {
                    marginRight: 12,
                  },
                  headerRight: () => (
                    <Button
                      uppercase={false}
                      labelStyle={{ fontWeight: "500", fontFamily: "System" }}
                      onPress={() => setAsync(null)}
                      color={"white"}
                    >
                      Sign Out
                    </Button>
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
