// The small square Payload shows in the collapsed sidebar header.
// Uses the apple-icon (the same one the browser favicon uses) so admin tabs
// and frontend tabs look identical.
import React from "react";

const Icon: React.FC = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/apple-icon.png"
    alt="CoopBank"
    width={28}
    height={28}
    style={{ width: 28, height: 28, borderRadius: 6 }}
  />
);

export default Icon;
