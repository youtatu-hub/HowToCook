import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MENUS_DIR = path.join(PROJECT_ROOT, 'menus');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'dist/menus-pdfs');
const IMAGE_PATTERN = /!\[[^\]]*]\(([^)]+)\)/g;
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

function collectMenuFiles(): string[] {
  if (!fs.existsSync(MENUS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(MENUS_DIR)
    .filter((file) => file.toLowerCase().endsWith('.md'))
    .sort()
    .map((file) => path.join(MENUS_DIR, file));
}

function extractImagePaths(markdown: string, menuFile: string): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = IMAGE_PATTERN.exec(markdown)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    if (raw.startsWith('http://') || raw.startsWith('https://')) continue;
    const cleaned = raw.split('#')[0].split('?')[0];
    const resolved = path.resolve(path.dirname(menuFile), cleaned);
    matches.push(resolved);
  }
  return matches;
}

async function buildPdfForMenu(menuFile: string) {
  const markdown = fs.readFileSync(menuFile, 'utf8');
  const imagePaths = extractImagePaths(markdown, menuFile);

  if (imagePaths.length === 0) {
    console.warn(`No images found in ${path.basename(menuFile)}`);
    return { outputPath: null, images: 0 };
  }

  const pdfDoc = await PDFDocument.create();
  let imageCount = 0;

  for (const imagePath of imagePaths) {
    if (!fs.existsSync(imagePath)) {
      console.warn(`Image not found: ${imagePath}`);
      continue;
    }
    const ext = path.extname(imagePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      console.warn(`Unsupported image type: ${imagePath}`);
      continue;
    }
    const bytes = fs.readFileSync(imagePath);
    const embedded =
      ext === '.png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
    const { width, height } = embedded.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embedded, { x: 0, y: 0, width, height });
    imageCount += 1;
  }

  if (imageCount === 0) {
    console.warn(`No supported images found in ${path.basename(menuFile)}`);
    return { outputPath: null, images: 0 };
  }

  const outputName = `${path.basename(menuFile, '.md')}.pdf`;
  const outputPath = path.join(OUTPUT_DIR, outputName);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return { outputPath, images: imageCount };
}

async function run() {
  if (!fs.existsSync(MENUS_DIR)) {
    console.error(`Menus directory not found: ${MENUS_DIR}`);
    process.exit(1);
  }

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const menuFiles = collectMenuFiles();
  if (menuFiles.length === 0) {
    console.error('No menu markdown files found.');
    process.exit(1);
  }

  let totalImages = 0;
  let totalPdfs = 0;

  for (const menuFile of menuFiles) {
    const result = await buildPdfForMenu(menuFile);
    if (result.outputPath) {
      totalPdfs += 1;
      totalImages += result.images;
      console.log(`Created ${path.basename(result.outputPath)} with ${result.images} images`);
    }
  }

  console.log(`Generated ${totalPdfs} PDFs with ${totalImages} images`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
