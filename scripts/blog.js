// scripts/blog.js
async function initBlog() {
    try {
        // Load post list
        const response = await fetch('posts/manifest.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
        // Display featured post (most recent)
        const featuredPost = posts[0];
        document.getElementById('featured-post').innerHTML = `
            <article class="featured-post-card">
                <img src="${featuredPost.image}" alt="${featuredPost.title}">
                <div class="featured-content">
                    <h2><a href="?slug=${featuredPost.slug}">${featuredPost.title}</a></h2>
                    <p>${featuredPost.description}</p>
                </div>
            </article>
        `;
        
        // Display other posts
        const postsContainer = document.getElementById('blog-posts');
        posts.slice(1).forEach(post => {
            postsContainer.innerHTML += `
                <article class="post-card">
                    <img src="${post.image}" alt="${post.title}">
                    <h3><a href="?slug=${post.slug}">${post.title}</a></h3>
                    <p>${post.description}</p>
                </article>
            `;
        });
        
        // Display categories
        const categories = [...new Set(posts.map(post => post.label))];
        const categoriesContainer = document.querySelector('.categories');
        categories.forEach(category => {
            categoriesContainer.innerHTML += `<li><a href="#" data-category="${category}">${category}</a></li>`;
        });
    } catch (error) {
        console.error('Error loading blog:', error);
        throw error;
    }
}
