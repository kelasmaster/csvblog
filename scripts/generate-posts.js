// scripts/generate-posts.js
const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Configuration
const POSTS_DIR = path.join(__dirname, '../posts-md');
const OUTPUT_DIR = path.join(__dirname, '../posts');
const TEMPLATE_PATH = path.join(__dirname, '../templates/post-template.html');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Process each markdown file
fs.readdirSync(POSTS_DIR).forEach(file => {
    if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
        const slug = file.replace('.md', '');
        
        // Parse front matter
        const frontMatter = content.match(/^---\n([\s\S]*?)\n---/)[1];
        const markdown = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        const metadata = {};
        frontMatter.split('\n').forEach(line => {
            const match = line.match(/^([^:]+):\s*(.*)/);
            if (match) metadata[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        });
        
        // Generate HTML
        const htmlContent = template
            .replace('{{title}}', metadata.title)
            .replace('{{content}}', marked.parse(markdown))
            .replace('{{date}}', metadata.date)
            .replace('{{author}}', metadata.author)
            .replace('{{image}}', metadata.image);
        
        // Write HTML file
        fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), htmlContent);
    }
});

console.log('Post generation complete!');
