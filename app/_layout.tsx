import AuthProvider from "@/components/AuthProvider";
import DropboxIcon from "@/components/DropboxIcon";
import { Stack } from "expo-router/stack";
import { maybeCompleteAuthSession } from "expo-web-browser";
import React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

maybeCompleteAuthSession();

function SwitchApp() {
  const { isLoaded, setAsync, value } = React.useContext(AuthProvider.Context);

  if (!isLoaded) {
    return <View />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="sign-in"
        options={{
          headerStyle: { backgroundColor: DropboxIcon.color },
          headerTintColor: "white",

          title: "Sign in",
        }}
      />

      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SwitchApp />
    </AuthProvider>
  );
}
