const fs = require('fs');

const file = './backend/src/controllers/api.controller.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace imports
code = code.replace(
  "import { schemes, mockApplications, addApplication, updateApplication } from '../repositories/mockStore';",
  "import { schemes, mockApplications } from '../repositories/mockStore';\nimport * as db from '../repositories/db';"
);

// getSchemes
code = code.replace(
  "const published = schemes.filter(s => s.status === 'Published');",
  "const published = await db.getPublishedSchemes();"
);

// getAllSchemes
code = code.replace(
  "res.json({ success: true, data: schemes });",
  "const data = await db.getAllSchemes();\n    res.json({ success: true, data });"
);

// getSchemeById
code = code.replace(
  "const scheme = schemes.find(s => s.id === req.params.id);",
  "const scheme = await db.getSchemeById(req.params.id);"
);

// getSchemeForm
code = code.replace(
  "const scheme = schemes.find(s => s.id === req.params.id && s.status === 'Published');",
  "const scheme = await db.getSchemeById(req.params.id);"
);

// getApplications
code = code.replace(
  /let apps = \[\.\.\.mockApplications\];.*res\.json\(\{ success: true, data: apps, total: apps\.length \}\);/s,
  `const apps = await db.getApplications({ schemeId: scheme as string, status: status as string, search: search as string });
    res.json({ success: true, data: apps, total: apps.length });`
);

// getApplicationById
code = code.replace(
  /const app = mockApplications\.find\(a => a\.id === req\.params\.id\);/g,
  `const app = await db.getApplicationById(req.params.id);`
);

// createApplication -> replace addApplication
code = code.replace(
  /const scheme = schemes\.find\(s => s\.id === schemeId && s\.status === 'Published'\);/,
  `const scheme = await db.getSchemeById(schemeId);`
);
code = code.replace(
  /addApplication\(newApp as typeof newApp\);/,
  `await db.addApplication(newApp as typeof newApp);`
);

// updateApplicationRoute
code = code.replace(
  /updateApplication\(req\.params\.id, req\.body\);/,
  `await db.updateApplication(req.params.id, req.body);`
);

// transitionApplication
code = code.replace(
  /updateApplication\(req\.params\.id, \{ status: to, timeline \}\);/,
  `await db.updateApplication(req.params.id, { status: to, timeline });`
);

// evaluateApplication
code = code.replace(
  /const scheme = schemes\.find\(s => s\.id === app\.schemeId\);/g,
  `const scheme = await db.getSchemeById(app.schemeId);`
);
code = code.replace(
  /updateApplication\(req\.params\.id, \{(.*?)\}\);/s,
  `await db.updateApplication(req.params.id, {$1});`
);

// raiseDeficiency
code = code.replace(
  /updateApplication\(req\.params\.id, \{ status: 'Deficiency', timeline, documents: docs \}\);/,
  `await db.updateApplication(req.params.id, { status: 'Deficiency', timeline, documents: docs });`
);

fs.writeFileSync(file, code);
console.log('done modifying api.controller.ts')
