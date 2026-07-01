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

We use a **Simplified Gitflow** model. It differs from the traditional Gitflow by not having a separate `release` branch, and preferring squashes for feature branches, but retaining merge commits for production releases. Using this Gitflow model ensures a stable production environment while allowing rapid iteration on features. 

<mermaid>
gitGraph
   %% Initial state
   commit id: "v2.1.0" tag: "v2.1.0"
   branch develop
   
   %% Feature Work on Beta Channel
   checkout develop
   branch feature/new-logic
   commit id: "Feature Work"
   checkout develop
   merge feature/new-logic id: "Squash to Dev"
   
   %% Production Release Process
   checkout main
   merge develop id: "Merge PR #Release-v2.2.0" tag: "v2.2.0"
   
   %% CRITICAL: The Sync Back
   checkout develop
   merge main id: "Sync v2.2.0 to Beta"
   
   %% Next cycle continues from the synced state
   commit id: "Next Feature"
</mermaid>

### Core Branches

| Branch | Purpose | Rule |
| :--- | :--- | :--- |
| `main` | **Stable Production.** Reflects the current `@latest` NPM release. | No direct commits. Only merge via Merge Commit PR from `develop`. Production tags should live in the `main` branch. |
| `develop` | **Integration & Beta.** Where features are combined and tested. | Primary branch for development. Base for all `@beta` releases. Beta tags should live in the `develop` branch. |
| `feature/*` | **New Features.** Isolated work on specific tasks. | Branch off `develop`, merge via Squash PR into `develop`. |

## The Development Lifecycle

### A. Feature Development
1. Branch off `develop`: `git checkout develop && git pull && git checkout -b feature/my-feature`.
2. Commit your changes locally.
3. Open a PR into `develop`. Once approved, merge it (prefer using squash and merge here).

*Dev docs are hosted at [https://custardui.js.org/devdocs](https://custardui.js.org/devdocs), and is updated with every commit or PR merge to the `develop` branch.*

### B. Beta Releases (from `develop` branch)
Use these when features are on `develop` and need to be tested in a non-local environment.

```sh
# 0. Be on the develop branch
git checkout develop

# 1. Bump version (e.g., 2.1.0 -> 2.1.1-beta.0)
npm run bump:beta

# 2. Release to NPM (@beta tag)
npm login
npm run release:beta

# CICD handles deployment of Beta Docs
```
*Beta docs are hosted at [https://custardui.js.org/betadocs](https://custardui.js.org/betadocs), and is updated on every beta release.*

### C. Production Release (from `main` branch)

When `develop` is stable and ready for the public.

1. **Create a PR** from `develop` to `main`, with name e.g. `Release v2.2.0`. **Merge via "Create a Merge Commit"** on the GitHub UI.

    > **AVOID using "Squash and Merge"** Since `develop` is a long-lived branch, squashing creates a "history mismatch.", with `main` and `develop` having different commit hashes for same code. This causes massive, redundant merge conflicts for the next sync or production hotfix. Using a **Merge Commit** (commit has 2 parents) preserves the shared history and allows for `git bisect` debugging.

2.  **Publish Stable Release on NPM:**
    * Switch to `main` locally, pull the merge, running the following commands:

```sh
# 0. Be on the main branch
git checkout main
git pull origin main

# 1. Bump to stable (e.g., 2.1.1-beta.x -> 2.1.1)
npm run bump:X # Use :patch, :minor or :major

# 2. Publish and Tag
npm login
npm run release:prod

# CICD handles deployment of Production Docs
```

3.  **Sync Back to 'develop' branch:** Open a PR from **`main` back to `develop`, with name e.g. `Sync: Release v2.2.0 back to develop`, merging with a merge commit.
    > **Why?** This ensures the official versioning and the release "node" are integrated into the Beta channel. Because you used a Merge Commit in Step 1, this PR should be conflict-free.


<mermaid>
gitGraph
   commit id: "v2.1.0" tag: "v2.1.0"
   branch develop
   checkout develop
   commit id: "Feature 1"
   commit id: "Feature 2"
   commit id: "Prepare Release"
   
   %% The PR from develop to main
   checkout main
   merge develop id: "Merge PR #Release-v2.2.0" tag: "v2.2.0"
   
   %% The 'Finalize' step (Back-merge)
   checkout develop
   merge main id: "Sync v2.2.0 back to Beta"
   
   %% Next Beta cycle starts here
   commit id: "Next Feature Start"
</mermaid>

*Production docs are hosted at [https://custardui.js.org](https://custardui.js.org), and is updated on every production release.*

### D. Hotfix Releases (from `main` branch)

If a critical bug is found on `main` that cannot wait for the next `develop` cycle, follow the hotfix flow to ensure production is patched and development remains in sync.

1. **Branch**: Create a `hotfix/*` branch off `main`.
2. **Fix**: Apply the critical fix and verify it locally.
3. **Merge to Main**: Open a PR into `main`. **Merge via "Create a Merge Commit."**
    > **Crucial:** Do not use "Squash and Merge." Squashing creates a new, unique commit hash on `main` that does not exist on your other branches. This "breaks" the historical link between them and causes massive, redundant merge conflicts when you try to sync the fix back to `develop`.
4. **Make Release**: Run `npm run bump:patch` and `npm run release:prod` to publish the release.
5. **Sync to Develop**: Merge **`main`** back into `develop` immediately.
    * **Why merge `main` instead of merging hotfix branch into `develop`?** Ensures `develop` receives both the code fix AND the automated version bump/tag created by the pipeline. Because we used a **Merge Commit** in Step 3, Git recognizes the shared history, making sync a clean "fast-forward" merge.
    * **If `develop` has diverged:** You may encounter merge conflicts. This is a critical safety check to ensure the production fix is correctly integrated into your new "Beta" logic.
    * **If the fix is no longer relevant:** Resolve the conflict by favoring the `develop` changes, but **still complete the merge.** This syncs the version history and prevents "ghost" conflicts in future releases.

<mermaid>
gitGraph
   commit id: "v2.1.0" tag: "v2.1.0"
   branch develop
   checkout develop
   commit id: "Feature Work"
   
   %% Hotfix
   checkout main
   branch hotfix/fix-bug
   checkout hotfix/fix-bug
   commit id: "Critical Fix"
   
   %% Merge to Main (Deploy)
   checkout main
   merge hotfix/fix-bug id: "Merge to Main" tag: "v2.1.1"
   
   %% Sync to Develop (The proper way)
   checkout develop
   merge main id: "Sync Main to Dev"
</mermaid>


## CDN Usage

To use CustardUI via CDN, update your script tags to the appropriate version tag.
* For quick updates, it is recommended to use unpkg as it updates and reflects the latest version faster than jsDelivr. (for usage without `@latest` annotation)
* For production, it may be recommended to use jsDelivr as it is purportedly more reliable and has better caching.

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
