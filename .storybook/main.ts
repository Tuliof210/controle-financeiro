import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.mdx"], // MDX docs only — no component stories
  addons: ["@storybook/addon-docs"],
};

export default config;
