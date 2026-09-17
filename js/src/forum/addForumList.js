import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import TagsPage from 'flarum/tags/components/TagsPage';
import ForumNodeList from './components/ForumNodeList';

export default function addForumList() {
  if (!TagsPage) {
    return;
  }

  override(TagsPage.prototype, 'hero', function () {
    return null;
  });

  extend(TagsPage.prototype, 'contentItems', function (items) {
    if (items.has('loading')) {
      items.remove('loading');
    }
    if (items.has('tagTiles')) {
      items.remove('tagTiles');
    }
    if (items.has('cloud')) {
      items.remove('cloud');
    }
    if (!items.has('pageTitle')) {
      items.add(
        'pageTitle',
        <div className="XfPageTitle">
          <h1>{app.forum.attribute('title')}</h1>
        </div>,
        110
      );
    }
    if (!items.has('forumList')) {
      items.add('forumList', <ForumNodeList />, 100);
    }
  });
}
