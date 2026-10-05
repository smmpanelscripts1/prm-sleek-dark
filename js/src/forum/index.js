import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import addChrome from './addChrome';
import addForumList from './addForumList';
import addSidebar from './addSidebar';
import addUserPage from './addUserPage';
import addDiscussion from './addDiscussion';

app.initializers.add(
  'prm-sleek-dark',
  () => {
    document.documentElement.classList.add('sleek-dark');

    extend('flarum/forum/components/HeaderPrimary', 'items', addChrome.navItems);
    extend('flarum/common/components/Page', 'oncreate', addChrome.ensure);

    override('flarum/forum/components/IndexPage', 'hero', function () {
      return null;
    });

    addForumList();
    addSidebar();
    addUserPage();
    addDiscussion();
  },
  { after: 'flarum-tags' }
);
