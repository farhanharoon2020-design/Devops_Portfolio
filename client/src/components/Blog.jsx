import React, { useState, useEffect } from 'react';
import '../styles/blog.css';

function BlogModal({ post, onClose }) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    fetch(`/api/blog/${post.slug}`)
      .then(r => r.json())
      .then(data => { if (data.html) setHtml(data.html); })
      .catch(() => setHtml('<p>Failed to load post.</p>'))
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [post.slug, onClose]);

  return (
    <div
      className="blog-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      id={`blog-modal-${post.slug}`}
    >
      <div className="blog-modal-panel">
        <button className="blog-modal-close" onClick={onClose} aria-label="Close" id="blog-modal-close">✕</button>
        <div className="blog-modal-meta">
          <span className="blog-modal-tag">{post.category || 'DevOps'}</span>
          <span className="blog-modal-date">{post.date}</span>
          <span className="blog-modal-read">{post.readTime || '5 min read'}</span>
        </div>
        <h2 className="blog-modal-title">{post.title}</h2>
        {loading ? (
          <div className="blog-modal-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="blog-skeleton-line" />)}
          </div>
        ) : (
          <div
            className="blog-modal-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}

function BlogCard({ post, onOpen }) {
  return (
    <div
      className="blog-card glass-card reveal"
      onClick={() => onOpen(post)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(post); }}
      id={`blog-card-${post.slug}`}
      role="button"
      tabIndex={0}
      aria-label={`Read ${post.title}`}
    >
      <div className="blog-card__top">
        <span className="blog-card__category">{post.category || 'DevOps'}</span>
        <span className="blog-card__read">{post.readTime || '5 min read'}</span>
      </div>
      <h3 className="blog-card__title">{post.title}</h3>
      <p className="blog-card__excerpt">{post.excerpt}</p>
      <div className="blog-card__footer">
        <span className="blog-card__date">{post.date}</span>
        <span className="blog-card__cta">Read More →</span>
      </div>
    </div>
  );
}

export default function Blog() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(null);

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => {
        if (data.posts) setPosts(data.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section className="section blog" id="blog">
      <div className="container">
        <h2 className="section-title reveal">Blog</h2>
        <p className="section-subtitle reveal">Thoughts on DevOps, automation &amp; infrastructure</p>
        <div className="section-divider" />

        {loading ? (
          <div className="blog__grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="blog-card glass-card blog-card--skeleton" />
            ))}
          </div>
        ) : (
          <div className="blog__grid">
            {posts.map(post => (
              <BlogCard key={post.slug} post={post} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      {active && <BlogModal post={active} onClose={() => setActive(null)} />}
    </section>
  );
}
