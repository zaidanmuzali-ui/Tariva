const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components');

const replacements = {
  'bg-blue-600': 'bg-primary-brand',
  'text-blue-600': 'text-primary-brand',
  'border-blue-600': 'border-primary-brand',
  'shadow-blue-600': 'shadow-primary-brand',
  'shadow-blue-500': 'shadow-primary-brand',
  'hover:bg-blue-700': 'hover:bg-primary-dark',
  'bg-blue-700': 'bg-primary-dark',
  'text-blue-700': 'text-primary-dark',
  'bg-blue-50': 'bg-primary-light',
  'text-blue-500': 'text-primary-brand/80',
  'text-blue-100': 'text-white/80',
  'border-blue-100': 'border-primary-brand/20',
  'border-blue-500': 'border-primary-brand/50',
  'bg-blue-100': 'bg-primary-light',
  'bg-emerald-600': 'bg-accent-success',
  'bg-emerald-500': 'bg-accent-success',
  'text-emerald-600': 'text-accent-success',
  'text-emerald-500': 'text-accent-success',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [oldClass, newClass] of Object.entries(replacements)) {
    // Replace class strings, avoiding partial matches where possible,
    // but a simple regex works because Tailwind classes are dash-separated
    const regex = new RegExp(oldClass + '(?=[\\s/\"\'])', 'g');
    content = content.replace(regex, newClass);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(directoryPath);
processFile(path.join(__dirname, 'src', 'App.tsx'));
