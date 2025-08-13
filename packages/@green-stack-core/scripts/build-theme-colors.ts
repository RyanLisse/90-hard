import fs from 'node:fs';
import { parseGlobalCSS } from '../utils/styleUtils';
import { excludeDirs, globRel } from './helpers/scriptUtils';

/* --- Constants ------------------------------------------------------------------------------- */

const genMsg = `// -i- Auto generated with "npx turbo run @green-stack/core#build:theme-colors"\n`;

/* --- build-theme-colors ---------------------------------------------------------------------- */

const buildThemeColors = () => {
  try {
    // Get all the global.css files in the workspace
    const nextGlobalCssPaths = globRel('../../apps/next/global.css').filter(
      excludeDirs
    );
    const featureGlobalCssPaths = globRel(
      '../../packages/**/global.css'
    ).filter(excludeDirs);
    const packageGlobalCssPaths = globRel(
      '../../packages/**/global.css'
    ).filter(excludeDirs);
    const allGlobalCssPaths = [
      ...nextGlobalCssPaths,
      ...featureGlobalCssPaths,
      ...packageGlobalCssPaths,
    ];

    // Combine all the global.css files into a single string
    const globalCss = allGlobalCssPaths.reduce((acc, cssPath) => {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      return `${acc}\n${cssContent}`;
    }, '');

    // Parse the global.css file to extract theme colors
    const themeColors = parseGlobalCSS(globalCss);

    // Write the theme colors to a file
    const themeColorsPath =
      '../../packages/@registries/themeColors.generated.ts';
    const themeColorsRegistry = `${genMsg}export const themeColors = ${JSON.stringify(themeColors, null, 4)} as const\n`;
    fs.writeFileSync(themeColorsPath, themeColorsRegistry);
  } catch (_err) {
    process.exit(1);
  }
};

/* --- init ------------------------------------------------------------------------------------ */

buildThemeColors();
