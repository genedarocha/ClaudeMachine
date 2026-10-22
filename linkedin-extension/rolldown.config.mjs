// Bundles the extension's service worker (src/background.js + the web app's ai.ts/humanizer.ts + the
// Anthropic SDK) into one file, since Chrome extensions can't load npm packages directly.
export default {
  input: 'linkedin-extension/src/background.js',
  platform: 'browser',
  output: {
    file: 'linkedin-extension/background.js',
    format: 'esm',
    codeSplitting: false,
    minify: true
  }
};
