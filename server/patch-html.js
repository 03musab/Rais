/**
 * patch-html.js
 * Replaces every  PRODUCTS/filename  reference in the client HTML files
 * with the corresponding Supabase Storage public URL.
 *
 * Run: node patch-html.js  (from the /server directory)
 */

const fs = require('fs');
const path = require('path');

const urlMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'supabase-urls.json'), 'utf8'));
const clientDir = path.join(__dirname, '..', 'client');
const htmlFiles = ['index.html', 'services.html', 'portfolio.html'];

for (const file of htmlFiles) {
    const filePath = path.join(clientDir, file);
    if (!fs.existsSync(filePath)) { console.log(`⏭  ${file} not found, skipping`); continue; }

    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;

    for (const [filename, url] of Object.entries(urlMap)) {
        // Match both encoded and unencoded forms of the path
        const raw = `PRODUCTS/${filename}`;
        const encoded = `PRODUCTS/${encodeURIComponent(filename).replace(/%20/g, '%20')}`;

        if (content.includes(raw)) {
            content = content.split(raw).join(url);
            changes++;
        }
        if (content.includes(encoded)) {
            content = content.split(encoded).join(url);
            changes++;
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} — ${changes} replacements`);
}

console.log('\n🏁 All HTML files updated with Supabase URLs!');
