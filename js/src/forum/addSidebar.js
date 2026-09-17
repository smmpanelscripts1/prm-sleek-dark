import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import Button from 'flarum/common/components/Button';
import Link from 'flarum/common/components/Link';
import avatar from 'flarum/common/helpers/avatar';
import humanTime from 'flarum/common/helpers/humanTime';

function t(key, params) {
  return app.translator.trans('prm-sleek-dark.forum.' + key, params);
}

function actionButtons() {
  const canStart = app.forum.attribute('canStartDiscussion') || !app.session.user;

  return (
    <div className="XfSidebar-actions">
      <Button className="Button" icon="fas fa-comments" onclick={() => m.route.set(app.route('index'))}>
        {t('new_posts')}
      </Button>
      <Button className="Button" icon="fas fa-edit" disabled={!canStart} onclick={() => IndexPage.prototype.newDiscussionAction().catch(() => {})}>
        {t('post_thread')}
      </Button>
    </div>
  );
}

function sidebarView() {
  const user = app.session.user;
  const discussions = app.store.all('discussions').slice(0, 3);
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <div className="XfSidebar">
      {actionButtons()}

      <div className="XfBlock">
        <h3 className="XfBlock-title">{t('trending')}</h3>
        <div className="XfBlock-body">
          {discussions.length
            ? discussions.map((d) => {
                const author = d.user && d.user();
                return (
                  <div className="XfTrend">
                    {author ? avatar(author) : null}
                    <div>
                      <Link href={app.route.discussion(d)}>{d.title()}</Link>
                      <div className="XfTrend-meta">
                        {author ? author.username() + ' · ' : ''}
                        {d.lastPostedAt ? humanTime(d.lastPostedAt()) : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            : t('none')}
        </div>
      </div>

      <div className="XfBlock">
        <h3 className="XfBlock-title">{t('staff_online')}</h3>
        <div className="XfBlock-body">
          {user && user.isAdmin() ? (
            <div className="XfPerson">
              {avatar(user)}
              <div>
                <div>{user.username()}</div>
                <div className="XfTrend-meta">{t('staff_admin')}</div>
              </div>
            </div>
          ) : (
            t('none')
          )}
        </div>
      </div>

      <div className="XfBlock">
        <h3 className="XfBlock-title">{t('members_online')}</h3>
        <div className="XfBlock-body">
          {user ? (
            <div className="XfPerson">
              {avatar(user)}
              <span>{user.username()}</span>
            </div>
          ) : (
            t('none')
          )}
          <div className="XfBlock-muted">{t('online_counts', { members: user ? 1 : 0, guests: user ? 0 : 1 })}</div>
        </div>
      </div>

      <div className="XfBlock">
        <h3 className="XfBlock-title">{t('statistics')}</h3>
        <div className="XfBlock-body">
          <div className="XfBlock-stat">
            <span>{t('stat_threads')}</span>
            <strong>{app.forum.attribute('sleekDiscussionCount') || 0}</strong>
          </div>
          <div className="XfBlock-stat">
            <span>{t('stat_messages')}</span>
            <strong>{app.forum.attribute('sleekPostCount') || app.forum.attribute('sleekDiscussionCount') || 0}</strong>
          </div>
          <div className="XfBlock-stat">
            <span>{t('stat_members')}</span>
            <strong>{app.forum.attribute('sleekUserCount') || 0}</strong>
          </div>
          <div className="XfBlock-stat">
            <span>{t('stat_latest')}</span>
            <strong>{app.forum.attribute('sleekLatestUsername') || '—'}</strong>
          </div>
        </div>
      </div>

      <div className="XfBlock">
        <h3 className="XfBlock-title">{t('share')}</h3>
        <div className="XfShare">
          <a href={'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl} target="_blank" rel="noopener">
            <i className="fab fa-facebook-f" />
          </a>
          <a href={'https://twitter.com/intent/tweet?url=' + shareUrl} target="_blank" rel="noopener">
            <i className="fab fa-twitter" />
          </a>
          <a href={'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + shareUrl} target="_blank" rel="noopener">
            <i className="fab fa-tumblr" />
          </a>
          <a href={'https://www.reddit.com/submit?url=' + shareUrl} target="_blank" rel="noopener">
            <i className="fab fa-reddit-alien" />
          </a>
          <a href={'https://pinterest.com/pin/create/button/?url=' + shareUrl} target="_blank" rel="noopener">
            <i className="fab fa-pinterest-p" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function addSidebar() {
  extend(IndexPage.prototype, 'sidebarItems', function (items) {
    if (items.has('newDiscussion')) {
      items.remove('newDiscussion');
    }
    if (items.has('nav')) {
      items.remove('nav');
    }

    items.add('xf-widgets', sidebarView(), 100);
  });
}
