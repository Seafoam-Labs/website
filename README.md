# Starlight Starter Kit: Basics

## Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## Commands

All commands are run from the root of the project, from a terminal:

- `npm install` to install dependencies

<!-- Separator -->

- `npm run dev` to start the local development server
- `npm run format` to format code with Prettier
- `npm run lint` to lint code with ESLint
- `npm run check` to run Astro's type checking diagnostics

<!-- Separator -->

- `npm run build` to build the production site
- `npm run preview` to preview the production build locally

<!-- Separator -->

- `npm run astro ...` to run Astro CLI commands, like `astro add` or `astro check`
- `npm run astro -- --help` to get help using the Astro CLI

## Useful links

### Formatting

- https://github.com/withastro/prettier-plugin-astro
- https://github.com/tailwindlabs/prettier-plugin-tailwindcss

### Linting

- https://github.com/eslint/eslint
- https://github.com/typescript-eslint/typescript-eslint
- https://github.com/ota-meshi/eslint-plugin-astro
- https://docs.astro.build/en/guides/typescript/#type-checking
