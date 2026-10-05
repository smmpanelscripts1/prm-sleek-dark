import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import ForumNodeList from './components/ForumNodeList';

export default function addForumList() {
  override('ext:flarum/tags/forum/components/TagsPage', 'hero', function () {
    return null;
  });

  extend('ext:flarum/tags/forum/components/TagsPage', 'contentItems', function (items) {
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
