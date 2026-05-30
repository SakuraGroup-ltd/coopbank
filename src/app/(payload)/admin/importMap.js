// Payload's admin uses string paths (e.g. "/src/payload/components/Logo") for
// component refs. This map resolves those paths to the actual React imports so
// SSR can render the custom Logo/Icon on the login page and sidebar.
import Logo from "../../../payload/components/Logo";
import Icon from "../../../payload/components/Icon";

export const importMap = {
  "/src/payload/components/Logo": Logo,
  "/src/payload/components/Icon": Icon,
};
