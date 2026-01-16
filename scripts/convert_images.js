
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directory: 'public' relative to the project root (where this script is presumably run or located appropriately)
// Assuming script is in 'scripts/' and 'public/' is at root.
const publicDir = path.resolve(__dirname, '../public');
const distDir = path.resolve(__dirname, '../dist'); // Also check dist just in case, though usually source is public

async function convertImages(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`Directory not found: ${directory}`);
        return;
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            await convertImages(filePath);
        } else if (path.extname(file).toLowerCase() === '.png') {
            const outputFilePath = filePath.replace(/\.png$/i, '.webp');

            console.log(`Converting: ${filePath} -> ${outputFilePath}`);

            try {
                await sharp(filePath)
                    .webp({ quality: 80 })
                    .toFile(outputFilePath);
                console.log(`Success: ${outputFilePath}`);
            } catch (err) {
                console.error(`Error converting ${filePath}:`, err);
            }
        }
    }
}

console.log('Starting conversion in public directory...');
await convertImages(publicDir);
console.log('Conversion complete.');
