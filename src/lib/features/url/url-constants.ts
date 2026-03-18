export const PARAM_SHOW_TOGGLE = 't-show';
export const PARAM_PEEK_TOGGLE = 't-peek';
export const PARAM_HIDE_TOGGLE = 't-hide';
export const PARAM_TABS = 'tabs';
export const PARAM_PH = 'ph';

export const PARAM_CV_SHOW = 'cv-show';
export const PARAM_CV_HIDE = 'cv-hide';
export const PARAM_CV_HIGHLIGHT = 'cv-highlight';

/** Parameters owned by FocusService — never touched by URLStateManager */
export const FOCUS_PARAMS = [PARAM_CV_SHOW, PARAM_CV_HIDE, PARAM_CV_HIGHLIGHT];
/** Parameters owned by URLStateManager */
export const MANAGED_PARAMS = [PARAM_SHOW_TOGGLE, PARAM_PEEK_TOGGLE, PARAM_HIDE_TOGGLE, PARAM_TABS, PARAM_PH];
