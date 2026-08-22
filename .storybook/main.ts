import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.mdx"], // MDX docs only — no component stories
  addons: ["@storybook/addon-docs"],
  viteFinal(viteConfig) {
    return {
      ...viteConfig,
      css: {
        ...viteConfig.css,
        preprocessorOptions: {
          ...viteConfig.css?.preprocessorOptions,
          scss: {
            ...viteConfig.css?.preprocessorOptions?.scss,
            loadPaths: ["src/styles"],
          },
        },
      },
    };
  },
};

export default config;
