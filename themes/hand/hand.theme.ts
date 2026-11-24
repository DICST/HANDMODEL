// The hand theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in hand.settings.json and the generated hand.settings.ts;
// change them with `astryx experimental theme editor set hand ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {handSettings} from './hand.settings';

export const handTheme = defineTheme({
  extends: handSettings,
  name: 'hand',
});
