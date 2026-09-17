import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import UserPage from 'flarum/forum/components/UserPage';
import UserCard from 'flarum/forum/components/UserCard';
import AvatarEditor from 'flarum/forum/components/AvatarEditor';
import UserControls from 'flarum/forum/utils/UserControls';
import Dropdown from 'flarum/common/components/Dropdown';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';
import avatar from 'flarum/common/helpers/avatar';
import username from 'flarum/common/helpers/username';
import listItems from 'flarum/common/helpers/listItems';
import humanTime from 'flarum/common/utils/humanTime';
import extractText from 'flarum/common/utils/extractText';

function t(key, params) {
  return extractText(app.translator.trans('prm-sleek-dark.forum.' + key, params || {}));
}

function locale() {
  return document.documentElement.lang || 'tr';
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(locale(), { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function addUserPage() {
  override(UserCard.prototype, 'view', function (original) {
    const className = this.attrs.className || '';
    if (className.indexOf('UserHero') === -1) {
      return original();
    }

    const user = this.attrs.user;
    const controls = UserControls.controls(user, this).toArray();
    const lastSeenAt = user.lastSeenAt();
    const online = user.isOnline && user.isOnline();

    return (
      <div className="UserCard Hero UserHero XfUserCard">
        <div className="XfUserCard-banner">
          <div className="XfUserCard-body">
            <div className="XfUserCard-avatar">
              {this.attrs.editable ? <AvatarEditor user={user} className="XfUserCard-editor" /> : avatar(user, { loading: 'eager' })}
            </div>
            <div className="XfUserCard-main">
              <h1 className="UserCard-identity">{username(user)}</h1>
              <div className="XfUserCard-dates">
                <div>
                  {t('profile_joined')}: {formatDate(user.joinTime())}
                </div>
                <div>
                  {t('profile_last_seen')}: {online ? t('profile_online') : lastSeenAt ? humanTime(lastSeenAt) : t('none')}
                  {' · '}
                  {t('profile_viewing', { username: user.displayName() })}
                </div>
              </div>
            </div>
            {!!controls.length && (
              <Dropdown
                className="UserCard-controls XfUserCard-controls"
                menuClassName="Dropdown-menu--right"
                buttonClassName="Button"
                label={app.translator.trans('core.forum.user_controls.button')}
                icon="fas fa-cog"
              >
                {controls}
              </Dropdown>
            )}
          </div>
          <div className="XfUserCard-stats">
            <div className="XfUserCard-stat">
              <span>{t('profile_messages')}</span>
              <strong>{user.commentCount()}</strong>
            </div>
            <div className="XfUserCard-stat XfUserCard-stat--end">
              <span>{t('profile_threads')}</span>
              <strong>{user.discussionCount()}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  });

  override(UserPage.prototype, 'view', function () {
    if (!this.user) {
      return (
        <div className="UserPage">
          <LoadingIndicator display="block" />
        </div>
      );
    }

    return (
      <div className="UserPage XfUserPage">
        <div className="container">
          <div className="XfUser-crumb">
            <Link href={app.session.user ? app.route.user(app.session.user) : app.route('index')}>{t('nav_members')}</Link>
            <span> › </span>
          </div>
          <UserCard
            user={this.user}
            className="Hero UserHero XfUserCard"
            editable={this.user.canEdit() || this.user === app.session.user}
            controlsButtonClassName="Button"
          />
          <nav className="UserPage-nav XfUser-tabs sideNav">
            <ul>{listItems(this.navItems().toArray())}</ul>
          </nav>
          <div className="UserPage-content XfUser-content">{this.content()}</div>
        </div>
      </div>
    );
  });
}
