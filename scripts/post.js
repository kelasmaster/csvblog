// scripts/post.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('slug');
    
    if (!postSlug) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize Marked.js
    marked.setOptions({
        breaks: true,
        gfm: true,
        smartypants: true
    });

    loadPostContent(postSlug)
        .then(post => {
            renderPost(post);
            updateDocumentMeta(post);
        })
        .catch(error => {
            console.error('Error loading post:', error);
            renderError();
        });

    // Add back button behavior
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('back-to-blog')) {
            e.preventDefault();
            window.history.back();
        }
    });
});

async function loadPostContent(slug) {
    const response = await fetch(`posts/${slug}.md`);
    if (!response.ok) throw new Error('Post not found');
    
    const content = await response.text();
    const frontMatter = content.match(/^---\n([\s\S]*?)\n---/)[1];
    const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    // Parse front matter
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const match = line.match(/^([^:]+):\s*(.*)/);
        if (match) {
            let value = match[2].trim();
            // Remove surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            metadata[match[1].trim()] = value;
        }
    });
    
    return {
        ...metadata,
        content: markdownContent,
        htmlContent: marked.parse(markdownContent),
        slug: slug
    };
}

function renderPost(post) {
    const postContainer = document.getElementById('post-content');
    
    postContainer.innerHTML = `
        <div class="post-header">
            <h1>${post.title}</h1>
            <div class="post-meta">
                <span class="post-author">By ${post.author}</span>
                <span class="post-date">${new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</span>
                <span class="post-category">${post.label}</span>
            </div>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-featured-image" loading="lazy">` : ''}
        </div>
        <div class="post-body">${post.htmlContent}</div>
        <div class="post-footer">
            <a href="index.html" class="back-to-blog">← Back to Blog</a>
        </div>
    `;
    
    // Add syntax highlighting (optional)
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

function updateDocumentMeta(post) {
    document.title = `${post.title} | My Blog`;
    
    // Update meta tags for SEO
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = post.description || post.content.substring(0, 160);
    }
    
    // Update OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.content = post.title;
    if (ogDesc) ogDesc.content = post.description || post.content.substring(0, 160);
    if (ogImage && post.image) ogImage.content = post.image;
}

function renderError() {
    document.getElementById('post-content').innerHTML = `
        <div class="error">
            <h2>Post Not Found</h2>
            <p>The requested post could not be loaded.</p>
            <a href="index.html" class="back-to-blog">Return to Blog Home</a>
        </div>
    `;
}
