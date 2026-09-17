import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import DiscussionHero from 'flarum/forum/components/DiscussionHero';
import CommentPost from 'flarum/forum/components/CommentPost';
import PostUser from 'flarum/forum/components/PostUser';
import PostMeta from 'flarum/forum/components/PostMeta';
import PostEdited from 'flarum/forum/components/PostEdited';
import ReplyPlaceholder from 'flarum/forum/components/ReplyPlaceholder';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import Link from 'flarum/common/components/Link';
import avatar from 'flarum/common/helpers/avatar';
import extractText from 'flarum/common/utils/extractText';

function t(key, params) {
  return extractText(app.translator.trans('prm-sleek-dark.forum.' + key, params || {}));
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(document.documentElement.lang || 'tr', { year: 'numeric', month: 'short', day: 'numeric' });
}

function discussionTags(discussion) {
  if (!discussion || !discussion.tags) {
    return [];
  }
  return (discussion.tags() || []).filter((tag) => tag);
}

export default function addDiscussion() {
  override(DiscussionHero.prototype, 'view', function () {
    const discussion = this.attrs.discussion;
    if (!discussion) {
      return <div />;
    }

    const user = discussion.user && discussion.user();
    const tags = discussionTags(discussion);

    return (
      <div className="XfThreadHead">
        <div className="container">
          <div className="XfThread-crumb">
            <Link href={app.route('tags')}>{t('nav_forums')}</Link>
            {tags.map((tag) => [
              <span> › </span>,
              <Link href={app.route('tag', { tags: tag.slug() })}>{tag.name()}</Link>,
            ])}
          </div>
          <h1 className="XfThread-title">{discussion.title()}</h1>
          <div className="XfThread-meta">
            <span>
              {t('thread_starter')} {user ? user.displayName() : t('none')}
            </span>
            <span> · </span>
            <span>
              {t('thread_start_date')} {formatDate(discussion.createdAt())}
            </span>
          </div>
        </div>
      </div>
    );
  });

  extend(CommentPost.prototype, 'headerItems', function (items) {
    if (items.has('meta')) {
      items.remove('meta');
    }
    if (items.has('edited')) {
      items.remove('edited');
    }
  });

  extend(CommentPost.prototype, 'contentItems', function (items) {
    const post = this.attrs.post;
    if (!post) {
      return;
    }

    items.add(
      'xf-attr',
      <div className="XfMsg-attr">
        <PostMeta post={post} />
        {post.isEdited() && !post.isHidden() ? <PostEdited post={post} /> : null}
      </div>,
      95
    );
  });

  override(PostMeta.prototype, 'view', function () {
    const post = this.attrs.post;
    if (!post) {
      return <div />;
    }

    return (
      <div className="XfMsg-meta">
        <a className="XfMsg-time" href={this.getPermalink(post)}>
          {formatDate(post.createdAt())}
        </a>
        <span className="XfMsg-number">#{post.number()}</span>
      </div>
    );
  });

  extend(PostUser.prototype, 'userViewItems', function (items, user) {
    if (!user) {
      return;
    }

    items.add(
      'xf-info',
      <div className="XfMsg-info">
        <div>
          {t('profile_joined')}: {formatDate(user.joinTime())}
        </div>
        <div>
          {t('profile_messages')}: {user.commentCount() || 0}
        </div>
      </div>,
      60
    );
  });

  override(ReplyPlaceholder.prototype, 'view', function (original) {
    if (app.composer.composingReplyTo(this.attrs.discussion)) {
      return original();
    }

    const reply = () => {
      DiscussionControls.replyAction.call(this.attrs.discussion, true).catch(() => {});
    };

    return (
      <button className="Post ReplyPlaceholder XfReplyPlaceholder" type="button" onclick={reply}>
        <span className="Post-header">{app.session.user ? avatar(app.session.user, { className: 'PostUser-avatar' }) : null}</span>
        <span className="XfReply-prompt">{app.translator.trans('core.forum.post_stream.reply_placeholder')}</span>
      </button>
    );
  });
}
