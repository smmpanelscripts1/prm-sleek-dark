var app = flarum.core.compat['forum/app'];
var extendMod = flarum.core.compat['common/extend'];
var extend = extendMod.extend;
var override = extendMod.override;
var Component = flarum.core.compat['common/Component'];
var IndexPage = flarum.core.compat['forum/components/IndexPage'];
var HeaderPrimary = flarum.core.compat['forum/components/HeaderPrimary'];
var Page = flarum.core.compat['common/components/Page'];
var Link = flarum.core.compat['common/components/Link'];
var LinkButton = flarum.core.compat['common/components/LinkButton'];
var Button = flarum.core.compat['common/components/Button'];
var humanTime = flarum.core.compat['common/helpers/humanTime'] || flarum.core.compat['common/utils/humanTime'];
var icon = flarum.core.compat['common/helpers/icon'];
var extractText = flarum.core.compat['common/utils/extractText'];
var avatar = flarum.core.compat['common/helpers/avatar'];
var username = flarum.core.compat['common/helpers/username'];
var listItems = flarum.core.compat['common/helpers/listItems'];
var UserPage = flarum.core.compat['forum/components/UserPage'];
var UserCard = flarum.core.compat['forum/components/UserCard'];
var AvatarEditor = flarum.core.compat['forum/components/AvatarEditor'];
var UserControls = flarum.core.compat['forum/utils/UserControls'];
var Dropdown = flarum.core.compat['common/components/Dropdown'];
var LoadingIndicator = flarum.core.compat['common/components/LoadingIndicator'];
var DiscussionHero = flarum.core.compat['forum/components/DiscussionHero'];
var CommentPost = flarum.core.compat['forum/components/CommentPost'];
var PostUser = flarum.core.compat['forum/components/PostUser'];
var PostMeta = flarum.core.compat['forum/components/PostMeta'];
var PostEdited = flarum.core.compat['forum/components/PostEdited'];
var ReplyPlaceholder = flarum.core.compat['forum/components/ReplyPlaceholder'];
var DiscussionControls = flarum.core.compat['forum/utils/DiscussionControls'];
var m = window.m;

function t(key, params) {
  return extractText(app.translator.trans('prm-sleek-dark.forum.' + key, params || {}));
}

function tm(key, params) {
  return app.translator.trans('prm-sleek-dark.forum.' + key, params || {});
}

function canStartDiscussion() {
  return app.forum.attribute('canStartDiscussion') || !app.session.user;
}

function openComposer() {
  IndexPage.prototype.newDiscussionAction().catch(function () {});
}

function pageTitle() {
  return m('div.XfPageTitle', m('h1', app.forum.attribute('title')));
}

function actionButtons() {
  return m('div.XfSidebar-actions', [
    m(
      Button,
      {
        className: 'Button',
        icon: 'fas fa-comments',
        onclick: function () {
          m.route.set(app.route('index'));
        },
      },
      t('new_posts')
    ),
    m(
      Button,
      {
        className: 'Button',
        icon: 'fas fa-edit',
        disabled: !canStartDiscussion(),
        onclick: openComposer,
      },
      t('post_thread')
    ),
  ]);
}

class ForumNodeList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    var self = this;
    this.parents = app.store.all('tags').filter(function (tag) {
      return !tag.isChild() && tag.position() !== null;
    });
    this.loading = this.parents.length === 0;

    if (!app.tagList) {
      this.loading = false;
      return;
    }

    app.tagList
      .load(['children', 'lastPostedDiscussion', 'parent'])
      .then(function () {
        self.parents = app.store.all('tags').filter(function (tag) {
          return !tag.isChild() && tag.position() !== null;
        });
        self.loading = false;
        m.redraw();
      })
      .catch(function () {
        self.loading = false;
        m.redraw();
      });
  }

  view() {
    if (this.loading) {
      return m('div.XfEmpty', '...');
    }

    if (!this.parents.length) {
      return m('div.XfEmpty', t('no_forums'));
    }

    var self = this;

    return m(
      'div.XfForumList',
      this.parents.map(function (parent) {
        return self.groupView(parent);
      })
    );
  }

  groupView(parent) {
    var self = this;
    var children = (parent.children() || []).slice().sort(function (a, b) {
      return (a.position() || 0) - (b.position() || 0);
    });
    var nodes = children.length ? children : [parent];

    return m('section.XfNodeGroup', [
      m('div.XfNodeGroup-header', parent.name()),
      nodes.map(function (node) {
        return self.nodeView(node);
      }),
    ]);
  }

  nodeView(tag) {
    var last = tag.lastPostedDiscussion && tag.lastPostedDiscussion();
    var user = last && last.user && last.user();
    var threads = tag.discussionCount ? tag.discussionCount() : 0;
    var messages = (tag.attribute && tag.attribute('sleekCommentCount')) || threads;

    return m('div.XfNode', [
      m('div.XfNode-icon', icon(tag.icon() || 'far fa-comment')),
      m('div.XfNode-main', [
        m(Link, { href: app.route.tag(tag) }, tag.name()),
        tag.description() ? m('p', tag.description()) : null,
      ]),
      m('div.XfNode-stat', [m('span', t('threads')), m('strong', threads)]),
      m('div.XfNode-stat', [m('span', t('messages')), m('strong', messages)]),
      m(
        'div.XfNode-last',
        last
          ? m('div', [
              m(Link, { href: app.route.discussion(last, last.lastPostNumber()) }, last.title()),
              m('div.XfNode-last-meta', [humanTime(last.lastPostedAt()), user ? [' · ', user.username()] : null]),
            ])
          : t('none')
      ),
    ]);
  }
}

function sidebarView() {
  var user = app.session.user;
  var discussions = app.store.all('discussions').slice(0, 3);
  var shareUrl = encodeURIComponent(window.location.href);

  return m('div.XfSidebar', [
    actionButtons(),
    m('div.XfBlock', [
      m('h3.XfBlock-title', t('trending')),
      m(
        'div.XfBlock-body',
        discussions.length
          ? discussions.map(function (d) {
              var author = d.user && d.user();
              return m('div.XfTrend', [
                m('div', [
                  m(Link, { href: app.route.discussion(d) }, d.title()),
                  m('div.XfTrend-meta', [author ? author.username() : '', d.lastPostedAt && d.lastPostedAt() ? [' · ', humanTime(d.lastPostedAt())] : null]),
                ]),
              ]);
            })
          : t('none')
      ),
    ]),
    m('div.XfBlock', [
      m('h3.XfBlock-title', t('staff_online')),
      m('div.XfBlock-body', user && user.isAdmin() ? [m('div', user.username()), m('div.XfTrend-meta', t('staff_admin'))] : t('none')),
    ]),
    m('div.XfBlock', [
      m('h3.XfBlock-title', t('members_online')),
      m('div.XfBlock-body', [
        user ? user.username() : t('none'),
        m('div.XfBlock-muted', t('online_counts', { members: user ? 1 : 0, guests: user ? 0 : 1 })),
      ]),
    ]),
    m('div.XfBlock', [
      m('h3.XfBlock-title', t('statistics')),
      m('div.XfBlock-body', [
        m('div.XfBlock-stat', [m('span', t('stat_threads')), m('strong', app.forum.attribute('sleekDiscussionCount') || 0)]),
        m('div.XfBlock-stat', [m('span', t('stat_messages')), m('strong', app.forum.attribute('sleekPostCount') || app.forum.attribute('sleekDiscussionCount') || 0)]),
        m('div.XfBlock-stat', [m('span', t('stat_members')), m('strong', app.forum.attribute('sleekUserCount') || 0)]),
        m('div.XfBlock-stat', [m('span', t('stat_latest')), m('strong', app.forum.attribute('sleekLatestUsername') || '—')]),
      ]),
    ]),
    m('div.XfBlock', [
      m('h3.XfBlock-title', t('share')),
      m('div.XfShare', [
        m('a', { href: 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, target: '_blank', rel: 'noopener', title: 'Facebook' }, m('i.fab.fa-facebook-f')),
        m('a', { href: 'https://twitter.com/intent/tweet?url=' + shareUrl, target: '_blank', rel: 'noopener', title: 'X' }, m('i.fab.fa-twitter')),
        m('a', { href: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + shareUrl, target: '_blank', rel: 'noopener', title: 'Tumblr' }, m('i.fab.fa-tumblr')),
        m('a', { href: 'https://www.reddit.com/submit?url=' + shareUrl, target: '_blank', rel: 'noopener', title: 'Reddit' }, m('i.fab.fa-reddit-alien')),
        m('a', { href: 'https://pinterest.com/pin/create/button/?url=' + shareUrl, target: '_blank', rel: 'noopener', title: 'Pinterest' }, m('i.fab.fa-pinterest-p')),
      ]),
    ]),
  ]);
}

function formatProfileDate(value) {
  if (!value) {
    return '';
  }
  var date = value instanceof Date ? value : new Date(value);
  try {
    return date.toLocaleDateString(document.documentElement.lang || 'tr', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return date.toLocaleDateString();
  }
}

function xfUserCardView() {
  var user = this.attrs.user;
  var controls = UserControls.controls(user, this).toArray();
  var lastSeenAt = user.lastSeenAt();
  var online = user.isOnline && user.isOnline();
  var lastSeenLabel = online ? t('profile_online') : lastSeenAt ? humanTime(lastSeenAt) : t('none');

  return m('div.UserCard.Hero.UserHero.XfUserCard', [
    m('div.XfUserCard-banner', [
      m('div.XfUserCard-body', [
        m(
          'div.XfUserCard-avatar',
          this.attrs.editable ? m(AvatarEditor, { user: user, className: 'XfUserCard-editor' }) : avatar(user, { loading: 'eager' })
        ),
        m('div.XfUserCard-main', [
          m('h1.UserCard-identity', username(user)),
          m('div.XfUserCard-dates', [
            m('div', t('profile_joined') + ': ' + formatProfileDate(user.joinTime())),
            m('div', [t('profile_last_seen') + ': ', lastSeenLabel, ' · ', t('profile_viewing', { username: user.displayName() })]),
          ]),
        ]),
        controls.length
          ? m(
              Dropdown,
              {
                className: 'UserCard-controls XfUserCard-controls',
                menuClassName: 'Dropdown-menu--right',
                buttonClassName: 'Button',
                label: app.translator.trans('core.forum.user_controls.button'),
                icon: 'fas fa-cog',
              },
              controls
            )
          : null,
      ]),
      m('div.XfUserCard-stats', [
        m('div.XfUserCard-stat', [m('span', t('profile_messages')), m('strong', user.commentCount())]),
        m('div.XfUserCard-stat.XfUserCard-stat--end', [m('span', t('profile_threads')), m('strong', user.discussionCount())]),
      ]),
    ]),
  ]);
}

function ensureChrome() {
  var appRoot = document.getElementById('app') || document.body;
  var header = document.getElementById('header');
  if (!header) {
    return;
  }

  if (!document.querySelector('.XfStaffBar') && app.session.user && app.session.user.isAdmin()) {
    document.documentElement.classList.add('sleek-has-staff');
    var bar = document.createElement('div');
    bar.className = 'XfStaffBar';
    bar.innerHTML =
      '<div class="container"><a href="' +
      app.forum.attribute('adminUrl') +
      '">' +
      t('staff_moderator') +
      '</a><a href="' +
      app.forum.attribute('adminUrl') +
      '">' +
      t('staff_admin') +
      '</a></div>';
    appRoot.insertBefore(bar, appRoot.firstChild);
  }

  if (!document.querySelector('.XfSubNav')) {
    var following = app.routes.following ? app.route('following') : app.route('index');
    var sub = document.createElement('div');
    sub.className = 'XfSubNav';
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
      '</a></div>';
    header.parentNode.insertBefore(sub, header.nextSibling);

    sub.addEventListener('click', function (event) {
      var link = event.target.closest('[data-xf]');
      if (!link) {
        return;
      }
      var action = link.getAttribute('data-xf');
      if (action === 'search') {
        event.preventDefault();
        var input = document.querySelector('.Search-input input, .Search input');
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

app.initializers.add(
  'prm-sleek-dark',
  function () {
    document.documentElement.classList.add('sleek-dark');

    extend(HeaderPrimary.prototype, 'items', function (items) {
      items.add('xf-forums', m(LinkButton, { href: app.route('tags') }, tm('nav_forums')), 100);
      items.add('xf-new', m(LinkButton, { href: app.route('index') }, tm('nav_whats_new')), 90);
      if (app.session.user) {
        items.add('xf-members', m(LinkButton, { href: app.route.user(app.session.user) }, tm('nav_members')), 80);
      }
    });

    extend(Page.prototype, 'oncreate', ensureChrome);

    override(IndexPage.prototype, 'hero', function () {
      return m('div');
    });

    extend(IndexPage.prototype, 'sidebarItems', function (items) {
      if (items.has('newDiscussion')) {
        items.remove('newDiscussion');
      }
      if (items.has('nav')) {
        items.remove('nav');
      }
      items.add('xf-widgets', sidebarView(), 100);
    });

    var TagsPage = flarum.core.compat['tags/components/TagsPage'];
    if (TagsPage) {
      override(TagsPage.prototype, 'hero', function () {
        return m('div');
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
          items.add('pageTitle', pageTitle(), 110);
        }
        if (!items.has('forumList')) {
          items.add('forumList', m(ForumNodeList), 100);
        }
      });
    }

    if (UserCard) {
      override(UserCard.prototype, 'view', function (original) {
        var className = this.attrs.className || '';
        if (className.indexOf('UserHero') === -1) {
          return original();
        }
        return xfUserCardView.call(this);
      });
    }

    if (UserPage) {
      override(UserPage.prototype, 'view', function () {
        if (!this.user) {
          return m('div.UserPage', m(LoadingIndicator, { display: 'block' }));
        }

        return m('div.UserPage.XfUserPage', [
          m('div.container', [
            m('div.XfUser-crumb', [
              m(Link, { href: app.session.user ? app.route.user(app.session.user) : app.route('index') }, tm('nav_members')),
              m('span', ' › '),
            ]),
            m(UserCard, {
              user: this.user,
              className: 'Hero UserHero XfUserCard',
              editable: this.user.canEdit() || this.user === app.session.user,
              controlsButtonClassName: 'Button',
            }),
            m('nav.UserPage-nav.XfUser-tabs.sideNav', m('ul', listItems(this.navItems().toArray()))),
            m('div.UserPage-content.XfUser-content', this.content()),
          ]),
        ]);
      });
    }

    if (DiscussionHero) {
      override(DiscussionHero.prototype, 'view', function () {
        var discussion = this.attrs.discussion;
        if (!discussion) {
          return m('div');
        }

        var user = discussion.user && discussion.user();
        var tags = discussion.tags ? (discussion.tags() || []).filter(Boolean) : [];

        return m('div.XfThreadHead', [
          m('div.container', [
            m(
              'div.XfThread-crumb',
              [m(Link, { href: app.route('tags') }, t('nav_forums'))].concat(
                tags.reduce(function (nodes, tag) {
                  var href = app.routes.tag ? app.route('tag', { tags: tag.slug() }) : app.route('tags');
                  nodes.push(m('span', ' › '));
                  nodes.push(m(Link, { href: href }, tag.name()));
                  return nodes;
                }, [])
              )
            ),
            m('h1.XfThread-title', discussion.title()),
            m('div.XfThread-meta', [
              m('span', t('thread_starter') + ' ' + (user ? user.displayName() : t('none'))),
              m('span', ' · '),
              m('span', t('thread_start_date') + ' ' + formatProfileDate(discussion.createdAt())),
            ]),
          ]),
        ]);
      });
    }

    if (CommentPost) {
      extend(CommentPost.prototype, 'headerItems', function (items) {
        if (items.has('meta')) {
          items.remove('meta');
        }
        if (items.has('edited')) {
          items.remove('edited');
        }
      });

      extend(CommentPost.prototype, 'contentItems', function (items) {
        var post = this.attrs.post;
        if (!post) {
          return;
        }
        items.add(
          'xf-attr',
          m('div.XfMsg-attr', [
            PostMeta ? m(PostMeta, { post: post }) : null,
            post.isEdited() && !post.isHidden() && PostEdited ? m(PostEdited, { post: post }) : null,
          ]),
          95
        );
      });
    }

    if (PostMeta) {
      override(PostMeta.prototype, 'view', function () {
        var post = this.attrs.post;
        if (!post) {
          return m('div');
        }
        var permalink = typeof this.getPermalink === 'function' ? this.getPermalink(post) : '#';
        return m('div.XfMsg-meta', [
          m('a.XfMsg-time', { href: permalink }, formatProfileDate(post.createdAt())),
          m('span.XfMsg-number', '#' + post.number()),
        ]);
      });
    }

    if (PostUser) {
      extend(PostUser.prototype, 'userViewItems', function (items, user) {
        if (!user) {
          return;
        }
        items.add(
          'xf-info',
          m('div.XfMsg-info', [
            m('div', t('profile_joined') + ': ' + formatProfileDate(user.joinTime())),
            m('div', t('profile_messages') + ': ' + (user.commentCount() || 0)),
          ]),
          60
        );
      });
    }

    if (ReplyPlaceholder) {
      override(ReplyPlaceholder.prototype, 'view', function (original) {
        if (app.composer.composingReplyTo(this.attrs.discussion)) {
          return original();
        }

        return m(
          'button.Post.ReplyPlaceholder.XfReplyPlaceholder',
          {
            type: 'button',
            onclick: function () {
              DiscussionControls.replyAction.call(this.attrs.discussion, true).catch(function () {});
            }.bind(this),
          },
          [
            m('span.Post-header', app.session.user ? avatar(app.session.user, { className: 'PostUser-avatar' }) : null),
            m('span.XfReply-prompt', app.translator.trans('core.forum.post_stream.reply_placeholder')),
          ]
        );
      });
    }
  },
  { after: 'flarum-tags' }
);

module.exports = {};
