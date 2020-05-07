import { AntDesign } from "@expo/vector-icons";
import * as React from "react";

const DropboxIcon = React.forwardRef((props: any, ref) => (
  <AntDesign
    ref={ref}
    name="dropbox"
    size={26}
    color={"white"}
    pointerEvents="none"
    {...props}
    style={[props.style, { overflow: "visible", width: 26 }]}
  />
));

export const color = "#0061FF";

DropboxIcon.color = color;

export default DropboxIcon;
