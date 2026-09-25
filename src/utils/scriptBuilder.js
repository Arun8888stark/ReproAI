const indent = code => code.trim().split('\n').map(l => `  ${l}`).join('\n');

export const buildScript = ({ title, targetUrl, steps, verification }) => `import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || ${JSON.stringify(targetUrl)};

test(${JSON.stringify(title || 'Bug reproduction')}, async ({ page }) => {
${[
  ...steps.map(s => `  // ${s.description}\n${indent(s.code)}`),
  `  // VERIFY: ${verification.description}\n${indent(verification.code)}`,
].join('\n\n')}
});
`;
