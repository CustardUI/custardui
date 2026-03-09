<frontmatter>
  title: "Changelog"
  layout: devGuide.md
  pageNav: 2
</frontmatter>


## Changelog

### v2.0.0 

**Rename from `customviews` to `custardui`**
* New npm release location at https://www.npmjs.com/package/@custardui/custardui 
* Update `customviews.config.json` to `custardui.config.json`
* Update the cdn link from `https://unpkg.com/@customviews-js/customviews@v1` to `https://unpkg.com/@custardui/custardui`
* (Optional) change `customviews.js` filename to `custardui.js`, and update `site.json` plugins array from `customviews` to `custardui`

**By default, the settings panel is now disabled.**
* Need to add settingsEnabled: true for settings, if not already present. See [settings configuration reference](../authorGuide/components/settings.md#configuration)

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