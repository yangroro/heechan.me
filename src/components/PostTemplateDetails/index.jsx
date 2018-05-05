import React from 'react';
import Link from 'gatsby-link';
import moment from 'moment';
import Disqus from '../Disqus/Disqus';
import './style.scss';

class PostTemplateDetails extends React.Component {
  render() {
    const { subtitle, url } = this.props.data.site.siteMetadata;
    const post = this.props.data.markdownRemark;
    const post_url = url + this.props.location.pathname;
    const tags = post.fields.tagSlugs;

    const homeBlock = (
      <div>
        <Link className="post-single__home-button" to="/">All Articles</Link>
      </div>
    );

    const tagsBlock = (
      <div className="post-single__tags">
        <ul className="post-single__tags-list">
          {tags && tags.map((tag, i) => (
            <li className="post-single__tags-list-item" key={tag}>
              <Link to={tag} className="post-single__tags-list-item-link">
                {post.frontmatter.tags[i]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );

    const commentsBlock = (
      <div>
        <Disqus postNode={post} siteMetadata={this.props.data.site.siteMetadata} />
      </div>
    );

    return (
      <div>
        {homeBlock}
        <div className="post-single">
          <div className="post-single__inner">
            <h1 className="post-single__title">{post.frontmatter.title}</h1>
            <div className="post-single__date">
              <em>{moment(post.frontmatter.date).format('YYYY년 M월 D일')}</em>
            </div>
            <div className="post-single__body" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
          <div className="post-single__footer">
            {tagsBlock}
            <hr />
            <p className="post-single__footer-text">
              {subtitle}
              <br />
              <a className="icon-twitter" href={`https://twitter.com/share?url=${post_url}`} target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
              <a className="icon-facebook" href={`http://www.facebook.com/sharer.php?u=${post_url}`} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </p>
            {commentsBlock}
          </div>
        </div>
      </div>
    );
  }
}

export default PostTemplateDetails;
