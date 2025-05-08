// scripts/blog.js
document.addEventListener('DOMContentLoaded', function() {
    // List of all markdown posts (update with your actual filenames)
    const postFiles = [
        'posts/future-of-ai.md',
        'posts/sustainable-living.md',
        'posts/healthy-eating.md',
        'posts/remote-work.md'
    ];

    // Load all posts
    Promise.all(postFiles.map(loadPost))
        .then(posts => {
            // Sort posts by date (newest first)
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            displayFeaturedPost(posts[0]);
            displayPosts(posts.slice(1)); // Show remaining as regular posts
            displayCategories(posts);
            setupCategoryFilters(posts);
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.querySelector('.blog-posts').innerHTML = 
                '<div class="error">Failed to load posts. Please refresh the page.</div>';
        });

    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    menuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });
});

async function loadPost(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        
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
        
        // Generate slug from filename
        const slug = filePath.split('/').pop().replace('.md', '');
        
        return {
            ...metadata,
            content: markdownContent,
            slug: slug,
            url: `post.html?slug=${slug}`
        };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        throw error;
    }
}

function displayPosts(posts) {
    const postsContainer = document.querySelector('.blog-posts');
    postsContainer.innerHTML = '';
    
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No blog posts found.</div>';
        return;
    }
    
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
                <p class="post-excerpt">${post.description || extractExcerpt(post.content)}</p>
                <a href="${post.url}" class="read-more">Read More</a>
            </div>
        `;
        postsContainer.appendChild(postEl);
    });
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
                <p class="post-excerpt">${post.description || extractExcerpt(post.content, 200)}</p>
                <a href="${post.url}" class="read-more">Read More</a>
            </div>
        </article>
    `;
}

function displayCategories(posts) {
    const categoriesContainer = document.querySelector('.categories');
    const categories = [...new Set(posts.map(post => post.label))];
    
    categoriesContainer.innerHTML = '';
    
    // Add "All" category first
    const allItem = document.createElement('li');
    allItem.innerHTML = '<a href="#" data-category="all" class="active">All</a>';
    categoriesContainer.appendChild(allItem);
    
    // Add other categories
    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-category="${category}">${category}</a>`;
        categoriesContainer.appendChild(li);
    });
}

function setupCategoryFilters(allPosts) {
    const categoriesContainer = document.querySelector('.categories');
    
    categoriesContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.categories a').forEach(a => {
                a.classList.remove('active');
            });
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            let filteredPosts = [...allPosts];
            
            if (category !== 'all') {
                filteredPosts = allPosts.filter(post => post.label === category);
            }
            
            // Re-display posts with the first one as featured
            if (filteredPosts.length > 0) {
                displayFeaturedPost(filteredPosts[0]);
                displayPosts(filteredPosts.slice(1));
            } else {
                document.querySelector('.featured-post').innerHTML = '';
                document.querySelector('.blog-posts').innerHTML = 
                    '<div class="no-posts">No posts found in this category.</div>';
            }
        }
    });
}

// Helper functions
function extractExcerpt(content, length = 100) {
    // Remove markdown formatting and code blocks
    const plainText = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '')        // Remove inline code
        .replace(/[#*\-_]/g, '')        // Remove markdown syntax
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Replace links with text
    
    return plainText.substring(0, length) + (plainText.length > length ? '...' : '');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
