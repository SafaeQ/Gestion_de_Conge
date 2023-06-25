import { Scrollbars } from "rc-scrollbars";
const CustomScrollbars = (props: any) => (
  <Scrollbars
    {...props}
    autoHide
    renderTrackHorizontal={(props) => (
      <div
        {...props}
        style={{ display: "none", height:'120%' }}
      />
    )}
  />
);

export default CustomScrollbars;
