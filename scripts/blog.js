// scripts/blog.js
async function initBlog() {
    try {
        // Load posts manifest
        const response = await fetch('posts/manifest.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        window.blogPosts = posts; // Store for single post view
        
        displayFeaturedPost(posts[0]);
        displayPosts(posts.slice(1));
        displayCategories(posts);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('blog-container').innerHTML = `
            <div class="error">
                <p>Failed to load posts. Please try again later.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    // Post manifest - update with your actual posts
    const postsManifest = [
        { 
            slug: 'future-of-ai',
            title: "The Future of AI",
            description: "Exploring artificial intelligence advancements",
            image: "https://images.unsplash.com/photo-1677442135136-760c813a743e",
            label: "Technology",
            date: "2023-06-15",
            author: "Jane Doe"
        },
        { 
            slug: 'sustainable-living',
            title: "Sustainable Living",
            description: "Eco-friendly lifestyle tips",
            image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7",
            label: "Lifestyle",
            date: "2023-06-10",
            author: "John Smith"
        }
        // Add more posts as needed
    ];

    // Display all content
    displayFeaturedPost(postsManifest[0]);
    displayPosts(postsManifest.slice(1));
    displayCategories(postsManifest);
    setupEventListeners();

    // For GitHub Pages: uncomment this and replace with your repo details
    // loadPostsFromGitHub('yourusername', 'your-repo', 'main');
});

// For GitHub Pages deployment (alternative approach)
async function loadPostsFromGitHub(username, repo, branch) {
    try {
        const response = await fetch(`https://api.github.com/repos/${kelasmaster}/${csvblog}/contents/posts?ref=${main}`);
        const files = await response.json();
        
        const posts = [];
        for (const file of files) {
            if (file.name.endsWith('.md')) {
                const postResponse = await fetch(file.download_url);
                const content = await postResponse.text();
                const post = parseMarkdownFile(content, file.name.replace('.md', ''));
                posts.push(post);
            }
        }
        
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayFeaturedPost(posts[0]);
        displayPosts(posts.slice(1));
        displayCategories(posts);
    } catch (error) {
        console.error('Error loading posts from GitHub:', error);
        document.querySelector('.blog-posts').innerHTML = `
            <div class="error">
                <p>Failed to load posts. Please try again later.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

function parseMarkdownFile(content, slug) {
    const frontMatter = content.match(/^---\n([\s\S]*?)\n---/)[1];
    const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const match = line.match(/^([^:]+):\s*(.*)/);
        if (match) {
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            metadata[match[1].trim()] = value;
        }
    });
    
    return {
        ...metadata,
        slug: slug,
        url: `post.html?slug=${slug}`
    };
}

function displayFeaturedPost(post) {
    if (!post) return;
    
    const featuredContainer = document.querySelector('.featured-post');
    featuredContainer.innerHTML = `
        <article class="featured-post-card">
            <div class="featured-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="featured-content">
                <span class="featured-label">Featured • ${post.label}</span>
                <h2><a href="${post.url}">${post.title}</a></h2>
                <div class="post-meta">
                    <span class="post-author">By ${post.author}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
                <p class="post-excerpt">${post.description}</p>
                <a href="${post.url}" class="read-more">Read More</a>
            </div>
        </article>
    `;
}

function displayPosts(posts) {
    const postsContainer = document.querySelector('.blog-posts');
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No blog posts found.</div>';
        return;
    }
    
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postEl = document.createElement('article');
        postEl.className = 'post-card';
        postEl.innerHTML = `
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <span class="post-label">${post.label}</span>
            </div>
            <div class="post-content">
                <h2><a href="${post.url}">${post.title}</a></h2>
                <div class="post-meta">
                    <span class="post-author">By ${post.author}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
                <p class="post-excerpt">${post.description}</p>
                <a href="${post.url}" class="read-more">Read More</a>
            </div>
        `;
        postsContainer.appendChild(postEl);
    });
}

function displayCategories(posts) {
    const categoriesContainer = document.querySelector('.categories');
    const categories = [...new Set(posts.map(post => post.label))];
    
    categoriesContainer.innerHTML = '<li><a href="#" data-category="all" class="active">All</a></li>';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-category="${category}">${category}</a>`;
        categoriesContainer.appendChild(li);
    });
}

function setupEventListeners() {
    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    menuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });

    // Category filtering
    document.querySelector('.categories').addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            document.querySelectorAll('.categories a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            const allPosts = Array.from(document.querySelectorAll('.post-card'));
            
            allPosts.forEach(post => {
                if (category === 'all' || post.querySelector('.post-label').textContent === category) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        }
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
