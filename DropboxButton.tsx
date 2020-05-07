import * as React from "react";
import { Platform } from "react-native";
import { Button } from "react-native-paper";
import { useHover } from "react-native-web-hooks";

import DropboxIcon from "./DropboxIcon";

// You can import from local files
// or any pure javascript modules available in npm
export default function DropboxButton({ onPress, loading }: any) {
  const ref = React.useRef(null);
  const isHovered = useHover(ref);

  return (
    <Button
      style={[
        {
          overflow: "visible",
          backgroundColor: "#0061FF",
          ...Platform.select({
            web: { transitionDuration: "150ms" },
            default: {},
          }),
        },
        isHovered && { backgroundColor: "#4f90f9" },
      ]}
      loading={loading}
      labelStyle={{
        ...Platform.select({ web: { userSelect: "none" }, default: {} }),

        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 20,
      }}
      mode="contained"
      uppercase={false}
      icon={() => <DropboxIcon />}
      onPress={onPress}
    >
      Login With Dropbox
    </Button>
  );
}
