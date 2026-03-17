/**
 * CustardUI Plugin for MarkBind
 * Injects the CustardUI auto-init script into every page.
 * Configuration is loaded from websiteUrl/BaseUrl/custardui.config.json
 */

// Local Development: ESM Modules, relative directory
// Markbind Deployment: Use unpkg CDN
function getScripts() {
	return [
		// Latest Beta Release
		'<script src="https://unpkg.com/@custardui/custardui@beta" data-base-url="/betadocs"></script>'
	];
}

const tagConfig = {
	'cv-toggle': {
		isCustomElement: true
	},
	'cv-tabgroup': {
		isCustomElement: true
	},
	'cv-tab': {
		isCustomElement: true
	},
	'cv-tab-body': {
		isCustomElement: true
	},
	'cv-tab-header': {
		isCustomElement: true
	},
	'cv-define-placeholder': {
		isCustomElement: true
	},
	'cv-placeholder-input': {
		isCustomElement: true
	}
};

// CJS: module.exports = { getScripts };
export { getScripts, tagConfig };
