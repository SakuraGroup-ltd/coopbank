// Payload's admin resolves component refs as "<path>#<export>". The schema
// path on the config (admin.components.graphics.Logo = "/src/payload/components/Logo")
// + the export name ("default") becomes the lookup key — so the importMap key
// MUST be "/src/payload/components/Logo#default", not "/src/payload/components/Logo".
// Without the #default suffix Payload silently fails to render the component, the
// whole admin tree errors during SSR, and the page returns an empty Suspense
// (blank white screen).
import Logo from "../../../payload/components/Logo";
import Icon from "../../../payload/components/Icon";

export const importMap = {
  "/src/payload/components/Logo#default": Logo,
  "/src/payload/components/Icon#default": Icon,
};
