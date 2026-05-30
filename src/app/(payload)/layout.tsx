/* eslint-disable @typescript-eslint/no-explicit-any */
// Payload root layout — keeps Payload's HTML/CSS isolated from the marketing site.
import "@payloadcms/next/css";
import "./custom.css";
import config from "../../../payload.config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";
import type { ServerFunctionClient } from "payload";

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
