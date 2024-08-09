import AuthProvider from "@/components/AuthProvider";
import DropboxIcon from "@/components/DropboxIcon";
import { B } from "@expo/html-elements";
import { FontAwesome } from "@expo/vector-icons";
import { Dropbox } from "dropbox";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useHover } from "react-native-web-hooks";

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

export default function HomeScreen() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
