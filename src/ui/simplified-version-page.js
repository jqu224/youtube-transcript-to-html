import {FAVICON_DATA_URI} from './brand.js';
import {SIMPLIFIED_VERSION_PAGE_TEMPLATE} from './simplified-version-page-template.js';

export function renderSimplifiedVersionTranscriptPage() {
  return SIMPLIFIED_VERSION_PAGE_TEMPLATE.replace('__FAVICON_DATA_URI__', FAVICON_DATA_URI);
}
