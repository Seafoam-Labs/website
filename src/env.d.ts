/// <reference types="astro/client" />
/// <reference types="@astrojs/starlight" />

declare module "virtual:starlight/user-config" {
  const Config: import("@astrojs/starlight/types").StarlightConfig;
  export default Config;
}

declare module "virtual:starlight/components/*" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
