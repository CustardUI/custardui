{% set title = "Setting up" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
</frontmatter>

# {{ title }}

<div class="lead">

This page explains how to set up your development environment to start contributing to CustardUI.
</div>

## Prerequisites

1. **MarkBind**: You will need <popover content="Run `npm install -g markbind-cli` to install MarkBind.">MarkBind</popover> installed globally to run the development server.

1. **Node.js** & **npm**: You will need Node.js and a recent version of npm.

## Setting up the dev environment

1. **Fork and clone** the CustardUI [GitHub repo](https://github.com/custardui/custardui).

1. **Install dependencies** by running `npm install` in the **root folder** of your cloned repo.

1. **Congratulations!** Now you are ready to start modifying CustardUI code.

## Development Workflow & Commands

Once dependencies are installed, you can use these main npm scripts from the root folder:

* **Active Development (Watch Mode)**:
  Runs Rollup in watch mode, automatically rebuilding files under `dist/` whenever you make changes in the `src/` directory:
  ```bash
  npm run dev
  ```

* **Run Tests**:
  Runs the unit tests using Vitest:
  ```bash
  npm test
  ```

* **Build for Production**:
  Cleans the `dist/` folder, builds TypeScript types, and bundles the library using Rollup:
  ```bash
  npm run build
  ```

* **Format & Lint**:
  Checks/fixes formatting and linting styles using Prettier and ESLint:
  ```bash
  npm run format
  npm run lint:fix
  ```

## Previewing Changes

To preview local changes in the documentation MarkBind site of CustardUI:
1. Build the library from the root folder:
   ```bash
   npm run build
   ```
2. Navigate to the `docs` folder and start the dev server:
   ```bash
   cd docs
   markbind serve
   ```

