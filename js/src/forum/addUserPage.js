import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import UserCard from 'flarum/forum/components/UserCard';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import listItems from 'flarum/common/helpers/listItems';

/**
 * Match live 1.8 profile: core UserHero (cover via prm-hero-image) + one
 * centered .container for tabs and content. No PageStructure sidebar column.
 */
export default function addUserPage() {
  override('flarum/forum/components/UserPage', 'view', function () {
    if (!this.user) {
      return (
        <div className="UserPage XfUserPage">
          <LoadingIndicator display="block" />
        </div>
      );
    }

    return (
      <div className="UserPage XfUserPage">
        <UserCard
          user={this.user}
          className="Hero UserHero XfUserCard"
          editable={this.user.canEdit() || this.user === app.session.user}
          controlsButtonClassName="Button"
        />
        <div className="container XfUser-body">
          <nav className="sideNav UserPage-nav XfUser-tabs">
            <ul>{listItems(this.navItems().toArray())}</ul>
          </nav>
          <div className="UserPage-content XfUser-content">{this.content()}</div>
        </div>
      </div>
    );
  });

  extend('flarum/forum/components/UserCard', 'view', function (vnode) {
    if (!vnode || !vnode.attrs || !vnode.attrs.className) {
      return;
    }
    if (String(vnode.attrs.className).indexOf('UserHero') === -1) {
      return;
    }
    vnode.attrs.className += ' XfUserCard';
  });
}
