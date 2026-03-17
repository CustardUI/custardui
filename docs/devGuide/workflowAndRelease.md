{% set title = "Project Workflow and Releases" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 4
</frontmatter>

## Release and Workflow Guide

This guide covers how code changes is managed in the CustardUI project, and the steps required to publish new versions to NPM and GitHub.

## Branching Strategy

We use a **Simplified Gitflow** model. This ensures a stable production environment while allowing rapid iteration on features.

<mermaid>
gitGraph
   %% Setup
   commit id: "Initial" tag: "v0.1"
   branch develop
   checkout develop
   commit id: "Work on Dev"

   %% Feature branch
   branch feature/new-logic
   checkout feature/new-logic
   commit id: "Feature Work"
   checkout develop
   merge feature/new-logic id: "Merge to Dev"

   %% Release
   checkout main
   merge develop id: "Release 1.0" tag: "v1.0"

   %% Continue on develop
   checkout develop
   commit id: "Next Feature"
</mermaid>

### Core Branches

| Branch | Purpose | Rule |
| :--- | :--- | :--- |
| `main` | **Stable Production.** Reflects the current `@latest` NPM release. | No direct commits. Only merge via **Squash PR** from `develop`. Production tags should live in the `main` branch. |
| `develop` | **Integration & Beta.** Where features are combined and tested. | Primary branch for development. Base for all `@beta` releases. Beta tags should live in the `develop` branch. |
| `feature/*` | **New Features.** Isolated work on specific tasks. | Must branch off and merge back into `develop`. |

### Why we use "Squash and Merge" for Production
When merging from `develop` into `main`, **always select "Squash and Merge" on GitHub.**

- **Prevents History Pollution**: Avoids bringing hundreds of "work-in-progress" commits into the production log.
- **Avoids Silent Reverts**: Standard merges can sometimes "revert" new code if the `main` branch history is stale. A Squash treats the state of `develop` as a single, clean snapshot, ensuring `main` matches exactly what you tested.

## The Development Lifecycle

### Step 1: Feature Development
1. Branch off `develop`: `git checkout develop && git pull && git checkout -b feature/my-feature`.
2. Commit your changes locally.
3. Open a PR into `develop`. Once approved, merge it (Standard merge or Squash are both fine here).

### Step 2: Beta Releases (Experimental)
Use these when features are on `develop` and need to be tested in a non-local environment.

```sh
# 0. Be on the develop branch
git checkout develop

# 1. Bump version (e.g., 2.1.0 -> 2.1.1-beta.0)
npm run bump:beta

# 2. Release to NPM (@beta tag)
npm login
npm run release:beta

# 3. Deploy Beta Docs
npm run deploydocs
```
*Beta docs are hosted at `https://custardui.js.org/betadocs`. Ensure the `data-base-url="/betadocs"` is set in your plugin script.*
- Make sure to update the `data-base-url` in the `custardui` plugin script to make sure that it is the right value i.e. (`data-base-url="/betadocs"`), when deploying documentation.

### Step 3: Production Release (Stable)

When `develop` is stable and ready for the public.

1. **Create a PR** from `develop` to `main`.
2. **Merge via "Squash and Merge"** on the GitHub UI. 
   > **Important:** Do not use a "Merge Commit" here. Squashing ensures that the messy integration history of `develop` doesn't overwrite your clean production code.
3. **Finalize the release on your local machine:**
   - Make sure to update the `data-base-url` in the `custardui` plugin script to make sure that it is the right value i.e. (`data-base-url="/betadocs"`), when deploying documentation.


```sh
# 0. Be on the main branch
git checkout main
git pull origin main

# 1. Bump to stable (e.g., 2.1.1-beta.x -> 2.1.1)
npm run bump:patch # Use :minor or :major if applicable

# 2. Publish and Tag
npm login
npm run release:prod
git push origin main --tags

# 3. Deploy Stable Docs
npm run deploydocs:stable
```

## Maintenance (Hotfixes)

If a critical bug is found on `main` that cannot wait for the next `develop` cycle, follow the hotfix flow to ensure production is patched and development remains in sync.

1. **Branch**: Create a `hotfix/*` branch off `main`.
2. **Fix**: Apply the critical fix and verify it.
3. **Merge to Main**: Create a PR into `main`. Use **Squash and Merge**.
4. **Tag & Release**: Switch to `main`, pull the changes, and run the production release commands (usually a `patch` bump).
5. **Sync to Develop**: Merge the `hotfix/*` branch (or `main`) back into `develop` immediately. This ensures the fix is not "undone" by the next major release from `develop`.

<mermaid>
gitGraph
   commit id: "v2.1.0" tag: "v2.1.0"
   branch develop
   checkout develop
   commit id: "Next Feature Work"
   
   %% Hotfix
   checkout main
   branch hotfix/fix-bug
   checkout hotfix/fix-bug
   commit id: "Critical Fix"
   
   %% Merge to Main (Deploy)
   checkout main
   merge hotfix/fix-bug id: "Squash to Main" tag: "v2.1.1"
   
   %% Merge to Develop (Sync)
   checkout develop
   merge hotfix/fix-bug id: "Sync Fix"
</mermaid>

---

##  Summary of Commands & CDNs

Use the following commands and CDN links to manage and consume releases.

### NPM & Deployment Commands

| Target | Bump Command | Release Command | Docs Site |
| :--- | :--- | :--- | :--- |
| **Beta** | `npm run bump:beta` | `npm run release:beta` | `custardui.js.org/betadocs` |
| **Production** | `npm run bump:patch` | `npm run release:prod` | `custardui.js.org` |

> **Note:** The `release:*` commands automatically run `npm run build` before publishing. Ensure you are authenticated via `npm login` before running these.

### CDN Usage

To use CustardUI via CDN, update your script tags to the appropriate version tag.

**unpkg:**
```html
<script src="https://unpkg.com/@custardui/custardui@latest"></script>
<script src="https://unpkg.com/@custardui/custardui@beta"></script>
```

**jsDelivr:**
```html
<script src="https://cdn.jsdelivr.net/npm/@custardui/custardui@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@custardui/custardui@beta"></script>
```
