const fs = require('fs');

let css = fs.readFileSync('ui/styles.css', 'utf8');

// Replace 100vh with 100dvh globally in styles.css
css = css.replace(/100vh/g, '100dvh');

fs.writeFileSync('ui/styles.css', css, 'utf8');
console.log("Updated styles.css to use 100dvh for mobile viewport fix.");
