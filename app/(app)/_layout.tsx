import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";

import { useSession } from "@/components/AuthProvider";
import React from "react";
import { Button } from "react-native-paper";

export default function AppLayout() {
  const { value, setAsync, isLoaded } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!value) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerStyle: { backgroundColor: "#0061FF" },
          headerTintColor: "white",

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
    </Stack>
  );
}
