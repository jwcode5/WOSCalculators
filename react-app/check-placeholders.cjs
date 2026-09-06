const fs = require('fs');
const path = require('path');
const d = 'src/components';
fs.readdirSync(d).filter(f => f.endsWith('.jsx')).forEach(f => {
  const c = fs.readFileSync(path.join(d, f), 'utf8');
  const m = c.match(/placeholder="([^"]+)"/g);
  if (m) console.log(f, m);
});
