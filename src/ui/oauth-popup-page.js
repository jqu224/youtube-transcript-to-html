import {bootstrapOAuthPopup} from './oauth-popup-runtime.js';
import {OAUTH_POPUP_TEMPLATE} from './oauth-popup-template.js';

export function renderOAuthPopupPage() {
  const runtimeSource = [
    'const __name = (target) => target;',
    `(${bootstrapOAuthPopup.toString()})();`,
  ].join('\n');
  return OAUTH_POPUP_TEMPLATE.replace('__OAUTH_POPUP_RUNTIME__', runtimeSource);
}
