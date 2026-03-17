{% set title = "Project Git Workflow" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 4
</frontmatter>

### Simplified Gitflow Workflow

CustardUI uses a simplified variant of [**Gitflow**](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). While it maintains the classic `main` vs `develop` separation, it removes the complexity of dedicated release branches in favor of direct merges.

## Core Workflow

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

## Branches

### `main` (Production)
The `main` branch represents the stable, production-ready code.
- **Rule**: Never commit directly to `main`.
- **Purpose**: Holds the history of official releases and production deployments.
- **Action**: When a release is ready, `develop` is merged into `main` and tagged.

### `develop` (Integration / Beta)
The `develop` branch is where all features are integrated.
- **Beta Releases**: Every commit to `develop` is considered a **Beta** release. It is used for testing and early feedback before the code is deemed "stable" for `main`.
- **Rule**: All features must be merged here and verified.

### `feature/*` (Development)
Each new task or feature gets its own branch.
- **Source**: Always branch off `develop`.
- **Action**: Merge back into `develop` once tests pass.

## Maintenance (Hotfixes)
The hotfix process follows the same simple merge logic as releases:

<mermaid>
gitGraph
   commit id: "v1.0" tag: "v1.0"
   branch develop
   checkout develop
   commit id: "Next Feature"
   
   %% Hotfix
   checkout main
   branch hotfix/fix-bug
   checkout hotfix/fix-bug
   commit id: "Critical Fix"
   
   %% Merge to Main (Deploy)
   checkout main
   merge hotfix/fix-bug id: "Deploy Fix" tag: "v1.0.1"
   
   %% Merge to Develop (Sync)
   checkout develop
   merge hotfix/fix-bug id: "Sync Fix"
</mermaid>

1. Create a `hotfix/*` branch off `main`.
2. Apply the critical fix.
3. Merge back into **both** `main` (and tag) and `develop`. This ensures the production fix isn't lost during the next release.

## Comparison to Gitflow
This model is essentially a **Simplified Gitflow**:
- **Same**: Separates integration (`develop`) from production (`main`). Uses `feature/` and `hotfix/` branches correctly.
- **Different**: Removes the `release/*` branch layer. Instead of a temporary release branch, we merge `develop` directly into `main`. This is ideal for smaller projects or rapid delivery cycles.

## Summary of Release Steps
1. **Feature**: Merge `feature/` -> `develop`.
2. **Beta**: Automated testing and verification happens on `develop`.
3. **Release**: Merge `develop` -> `main`.
4. **Tag**: Run `git tag v1.x` on `main`.
5. **Push**: Push `main` and tags to origin.

