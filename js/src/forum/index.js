import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import Page from 'flarum/common/components/Page';
import addChrome from './addChrome';
import addForumList from './addForumList';
import addSidebar from './addSidebar';
import addUserPage from './addUserPage';
import addDiscussion from './addDiscussion';

app.initializers.add(
  'prm-sleek-dark',
  () => {
    document.documentElement.classList.add('sleek-dark');

    extend(HeaderPrimary.prototype, 'items', addChrome.navItems);
    extend(Page.prototype, 'oncreate', addChrome.ensure);

    override(IndexPage.prototype, 'hero', function () {
      return null;
    });

    addForumList();
    addSidebar();
    addUserPage();
    addDiscussion();
  },
  { after: 'flarum-tags' }
);
