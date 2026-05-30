// Replaces Payload's default mark on the login page + sidebar header.
// Uses the same coopbank-logo.png the public site uses, so the admin clearly
// reads as "CoopBank" not "Payload".
import React from "react";

const Logo: React.FC = () => (
  <div className="cb-logo">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/images/coopbank-logo.png"
      alt="Cooperative Bank Tanzania"
      width={220}
      height={64}
      style={{ width: 220, height: "auto", display: "block", margin: "0 auto" }}
    />
  </div>
);

export default Logo;
