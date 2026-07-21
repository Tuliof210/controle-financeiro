import type { Preview } from "@storybook/nextjs-vite";
import { addons } from "storybook/preview-api";
import { jetBrainsMono, pressStart2P } from "../src/styles/fonts";
import "../src/styles/globals.scss";

document.documentElement.classList.add(
  pressStart2P.variable,
  jetBrainsMono.variable,
);

// `@storybook/addon-themes`'s decorators only run for stories with an
// attached CSF story — this project's Foundations pages are docs-only
// `<Meta>` blocks (no components yet), so the toggle is wired directly
// against the core globals/channel API instead, which applies to any page.
const urlTheme = new URLSearchParams(window.location.search)
  .get("globals")
  ?.match(/theme:(\w+)/)?.[1];
document.documentElement.setAttribute("data-theme", urlTheme ?? "light");

addons
  .getChannel()
  .on("updateGlobals", ({ globals }: { globals: Record<string, string> }) => {
    if (globals.theme) {
      document.documentElement.setAttribute("data-theme", globals.theme);
    }
  });

const preview: Preview = {
  initialGlobals: { theme: "light" },
  globalTypes: {
    theme: {
      description: "Light / dark theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    backgrounds: { disable: true }, // theme tokens own the background
  },
};

export default preview;
