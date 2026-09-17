import app from 'flarum/forum/app';
import LinkButton from 'flarum/common/components/LinkButton';
import IndexPage from 'flarum/forum/components/IndexPage';

function t(key, params) {
  return app.translator.trans('prm-sleek-dark.forum.' + key, params);
}

export function navItems(items) {
  items.add('xf-forums', <LinkButton href={app.route('tags')}>{t('nav_forums')}</LinkButton>, 100);
  items.add('xf-new', <LinkButton href={app.route('index')}>{t('nav_whats_new')}</LinkButton>, 90);

  if (app.session.user) {
    items.add('xf-members', <LinkButton href={app.route.user(app.session.user)}>{t('nav_members')}</LinkButton>, 80);
  }
}

export function pageTitle() {
  return (
    <div className="XfPageTitle">
      <h1>{app.forum.attribute('title')}</h1>
    </div>
  );
}

export function ensure() {
  const appRoot = document.getElementById('app') || document.body;
  const header = document.getElementById('header');
  if (!header) {
    return;
  }

  if (!document.querySelector('.XfStaffBar') && app.session.user && app.session.user.isAdmin()) {
    document.documentElement.classList.add('sleek-has-staff');
    const bar = document.createElement('div');
    bar.className = 'XfStaffBar';
    bar.innerHTML =
      '<div class="container">' +
      '<a href="' +
      app.forum.attribute('adminUrl') +
      '">' +
      t('staff_moderator') +
      '</a>' +
      '<a href="' +
      app.forum.attribute('adminUrl') +
      '">' +
      t('staff_admin') +
      '</a>' +
      '</div>';
    appRoot.insertBefore(bar, appRoot.firstChild);
  }

  if (!document.querySelector('.XfSubNav')) {
    const sub = document.createElement('div');
    sub.className = 'XfSubNav';
    const following = app.routes.following ? app.route('following') : app.route('index');
    sub.innerHTML =
      '<div class="container">' +
      '<a class="XfSubNav-link" data-xf="new" href="' +
      app.route('index') +
      '">' +
      t('sub_new_posts') +
      '</a>' +
      '<a class="XfSubNav-link" data-xf="find" href="' +
      app.route('index') +
      '">' +
      t('sub_find_threads') +
      '</a>' +
      '<a class="XfSubNav-link" data-xf="watched" href="' +
      following +
      '">' +
      t('sub_watched') +
      '</a>' +
      '<a class="XfSubNav-link" data-xf="search" href="#">' +
      t('sub_search') +
      '</a>' +
      '<a class="XfSubNav-link" data-xf="read" href="#">' +
      t('sub_mark_read') +
      '</a>' +
      '</div>';
    header.parentNode.insertBefore(sub, header.nextSibling);

    sub.addEventListener('click', function (event) {
      const link = event.target.closest('[data-xf]');
      if (!link) {
        return;
      }
      const action = link.getAttribute('data-xf');
      if (action === 'search') {
        event.preventDefault();
        const input = document.querySelector('.Search-input input, .Search input');
        if (input) {
          input.focus();
        }
      }
      if (action === 'read') {
        event.preventDefault();
        IndexPage.prototype.markAllAsRead();
      }
    });
  }
}

export default { navItems, pageTitle, ensure };
