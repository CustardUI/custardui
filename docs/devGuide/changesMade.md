<frontmatter>
  title: "Changelog"
  layout: devGuide.md
  pageNav: 2
</frontmatter>


## Changelog

Also refer to [release notes](https://github.com/CustardUI/custardui/releases) to view detailed changes and version history.

### v2.2.*

**User Facing Changes**:

* feat: Add new cv-label component (cv-tags) for adaptations usage
* feat: Update url generation of settings to include all shown in settings panel
* feat: Add siteManaged property for Adaptation for toggles and placeholder components
* feat: Update text annotation home plate shape to have fixed triangle shape
* chore: remove baseURL field from config, source of truth from script baseurl tag
* fix: Fix anchor descriptor logic and resolution
* fix: disable settings widget by default 

**Developer Facing Changes**:

* feat: Update release docs and add CICD
* refactor: Refactor dom-element-locator to own feature
* refactor: Remove legacy dynamic asset rendering feature, 
* fix: Additional bug fixes include updating deployment scripts, documentation, edge case for empty config json.
* fix: Add focus banner hotfix


### v2.1.*

**User Facing Changes**:

* feat: update feature styling (updates share default to highlight mode, update wordings, default highlight color)
* feat: Improve tabgroups style 
* feat: Add attribution text to modal, update toggle stylings
* feat: Enhance text annotations in highlights styling (Add homeplate shaping)
* fix: Fix scroll logic to fix issues with window jumping around
* fix: Align placeholder defaultValue handling with conditional logic
* fix: Fix adaptation bug, where ?adapt=clear now wipes full user state including placeholders
* fix: Implement stable element text hashing for placeholders, now fingerprints for elements containing placeholders work properly.
* docs: Update documentation site for v2, adding URL-sharing documentation for placeholders, toggles, and tabs

**Developer Facing Changes**:

* feat: Add semver label workflow (GitHub actions)
* refactor: Refactor dom-element-locator to own feature

### v2.0.0 

**Rename from `customviews` to `custardui`**
* New npm release location at https://www.npmjs.com/package/@custardui/custardui 
* Update `customviews.config.json` to `custardui.config.json`
* Update the cdn link from `https://unpkg.com/@customviews-js/customviews@v1` to `https://unpkg.com/@custardui/custardui`
* (Optional) change `customviews.js` filename to `custardui.js`, and update `site.json` plugins array from `customviews` to `custardui`

**Updates to the default `custardui.config.json`**
* By default, the settings panel is now disabled: To show the settings panel, add `settingsEnabled: true` to `custardui.config.json`. See [settings configuration reference](../authorGuide/components/settings.md#configuration)
* `showURL` option in `.json` file has been removed. Functionality to persistently show settings configuration in URL has been removed.

### Features Added
**Readable/Programmable URL for Settings Sharing:**
* For tabs, can refer to [tabs url sharing](../authorGuide/components/tabs.md#shareable-url)
* For toggles, can refer to [toggles url sharing](../authorGuide/components/toggles.md#shareable-url)
* For placeholders, can refer to [ph url sharing](../authorGuide/components/placeholders.md#shareable-url)

Also added a [unified URL Sharing page](../authorGuide/urlSharing.md) that gives an overview of the url encoding behavior.

**Focused view sharing**
* should be directly usable.
* Added notes, customizable box colors, up and down arrows

**Placeholders**:
* Some support for the placeholder fallback, but working on refinement of behaviour given a default value.


---


### v1.7.0

* Deprecated use of param `cv-focus` in favor for `cv-show`
* Added fix for the tabgroup placeholders not registering unless there is tabgroup
* Update placeholder input component to look nicer
* Updated focused views feature to select SPAN, TR (table rows)
* To use beta version, update script, and refer to separate [beta docs subsite](https://custardui.js.org)
* Updated focused Views
* Added placeholders and docs