/**
 * upload-products.js
 * Uploads every image from client/PRODUCTS/ to Supabase Storage
 * and saves a JSON mapping { filename: publicUrl } to supabase-urls.json
 *
 * Prerequisites:
 *   1. Create a bucket called "products" in Supabase Dashboard → Storage → New bucket (set to Public)
 *   2. Run: node upload-products.js  (from the /server directory)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET = 'products';
const PRODUCTS_DIR = path.join(__dirname, '..', 'client', 'PRODUCTS');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadAll() {
    const files = fs.readdirSync(PRODUCTS_DIR).filter(f =>
        /\.(jpe?g|png|webp|gif)$/i.test(f)
    );

    console.log(`\n📦 Uploading ${files.length} files to bucket "${BUCKET}"...\n`);

    const urlMap = {};
    let ok = 0, fail = 0;

    for (const filename of files) {
        const filePath = path.join(PRODUCTS_DIR, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const contentType = /\.png$/i.test(filename) ? 'image/png' : 'image/jpeg';

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filename, fileBuffer, { contentType, upsert: true });

        if (error) {
            console.error(`  ❌ ${filename}: ${error.message}`);
            fail++;
        } else {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
            urlMap[filename] = data.publicUrl;
            console.log(`  ✅ ${filename}`);
            ok++;
        }
    }

    console.log(`\n🏁 Done — ${ok} uploaded, ${fail} failed`);
    const out = path.join(__dirname, 'supabase-urls.json');
    fs.writeFileSync(out, JSON.stringify(urlMap, null, 2));
    console.log(`📄 URL map saved → ${out}`);
}

uploadAll().catch(err => { console.error(err); process.exit(1); });
