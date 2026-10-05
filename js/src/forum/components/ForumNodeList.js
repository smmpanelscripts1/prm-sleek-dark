import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Link from 'flarum/common/components/Link';
import Avatar from 'flarum/common/components/Avatar';
import Icon from 'flarum/common/components/Icon';
import humanTime from 'flarum/common/helpers/humanTime';

function t(key) {
  return app.translator.trans('prm-sleek-dark.forum.' + key);
}

export default class ForumNodeList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
    this.parents = [];

    if (!app.tagList) {
      this.loading = false;
      return;
    }

    this.parents = app.store.all('tags').filter((tag) => !tag.isChild() && tag.position() !== null);
    this.loading = this.parents.length === 0;

    app.tagList
      .load(['children', 'lastPostedDiscussion', 'lastPostedDiscussion.user', 'parent'])
      .then(() => {
        this.parents = app.store.all('tags').filter((tag) => !tag.isChild() && tag.position() !== null);
        this.loading = false;
        m.redraw();
      })
      .catch(() => {
        this.parents = app.store.all('tags').filter((tag) => !tag.isChild() && tag.position() !== null);
        this.loading = false;
        m.redraw();
      });
  }

  view() {
    if (this.loading) {
      return <div className="XfEmpty">...</div>;
    }

    if (!this.parents.length) {
      return <div className="XfEmpty">{t('no_forums')}</div>;
    }

    return <div className="XfForumList">{this.parents.map((parent) => this.groupView(parent))}</div>;
  }

  groupView(parent) {
    const children = (parent.children() || []).slice().sort((a, b) => (a.position() || 0) - (b.position() || 0));
    const nodes = children.length ? children : [parent];

    return (
      <section className="XfNodeGroup" key={parent.id()}>
        <div className="XfNodeGroup-header">{parent.name()}</div>
        {nodes.map((node) => this.nodeView(node))}
      </section>
    );
  }

  nodeView(tag) {
    const last = tag.lastPostedDiscussion && tag.lastPostedDiscussion();
    const user = last && last.user && last.user();
    const threads = tag.discussionCount ? tag.discussionCount() : 0;
    const messages = (tag.attribute && tag.attribute('sleekCommentCount')) || threads;

    return (
      <div className="XfNode" key={tag.id()}>
        <div className="XfNode-icon">
          <Icon name={tag.icon() || 'far fa-comment'} />
        </div>
        <div className="XfNode-main">
          <Link href={app.route.tag(tag)}>{tag.name()}</Link>
          {tag.description() ? <p>{tag.description()}</p> : null}
        </div>
        <div className="XfNode-stat">
          <span>{t('threads')}</span>
          <strong>{threads}</strong>
        </div>
        <div className="XfNode-stat">
          <span>{t('messages')}</span>
          <strong>{messages}</strong>
        </div>
        <div className="XfNode-last">
          {last ? (
            [
              user ? <Avatar user={user} /> : null,
              <div>
                <Link href={app.route.discussion(last, last.lastPostNumber())}>{last.title()}</Link>
                <div className="XfNode-last-meta">
                  {humanTime(last.lastPostedAt())}
                  {user ? [' - ', user.username()] : null}
                </div>
              </div>,
            ]
          ) : (
            t('none')
          )}
        </div>
      </div>
    );
  }
}
