const fs = require('fs');

const file = './backend/src/controllers/api.controller.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix updateApplication typo at line 179
code = code.replace(
  /updateApplication\(req\.params\.id, \{\n\s*rulesEvaluation:/,
  "await db.updateApplication(req.params.id as string, {\n      rulesEvaluation:"
);

// Fix all req.params.id casts
code = code.replace(/req\.params\.id/g, "(req.params.id as string)");

fs.writeFileSync(file, code);
console.log('done fixing TS types');
