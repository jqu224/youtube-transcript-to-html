import {TAB_CONFIG} from '../lib/render-model.js';
import {APP_TITLE, FAVICON_DATA_URI} from './brand.js';
import {APP_PAGE_TEMPLATE} from './app-page-template.js';

export function renderAppPage() {
  const tabButtons = TAB_CONFIG.map((tab) => {
    return `
      <button class="tab-button${tab.id === 'smartnote' ? ' is-active' : ''}" type="button" data-tab-button="${tab.id}">
        ${tab.label}
      </button>
    `;
  }).join('');

  return APP_PAGE_TEMPLATE
    .replace('__APP_TITLE__', APP_TITLE)
    .replace('__FAVICON_DATA_URI__', FAVICON_DATA_URI)
    .replace('__TAB_BUTTONS__', tabButtons);
}
