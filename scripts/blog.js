// scripts/blog.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('posts/manifest.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
        // Display featured post
        const featured = posts[0];
        document.getElementById('featured-post').innerHTML = `
            <article class="featured-post-card">
                <img src="${featured.image}" alt="${featured.title}">
                <div class="featured-content">
                    <h2><a href="posts/${featured.slug}.html">${featured.title}</a></h2>
                    <p>${featured.description}</p>
                </div>
            </article>
        `;
        
        // Display other posts
        const postsContainer = document.getElementById('blog-posts');
        posts.slice(1).forEach(post => {
            postsContainer.innerHTML += `
                <article class="post-card">
                    <img src="${post.image}" alt="${post.title}">
                    <h3><a href="posts/${post.slug}.html">${post.title}</a></h3>
                    <p>${post.description}</p>
                </article>
            `;
        });
    } catch (error) {
        document.getElementById('blog-posts').innerHTML = `
            <div class="error">Failed to load posts. Please try again later.</div>
        `;
        console.error(error);
    }
});
