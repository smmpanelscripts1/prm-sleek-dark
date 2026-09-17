<?php

namespace Prm\SleekDark;

use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Extend;
use Flarum\Post\Post;
use Flarum\Tags\Api\Controller\ListTagsController;
use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\Tags\Tag;
use Flarum\User\User;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\ApiController(ListTagsController::class))
        ->addOptionalInclude('lastPostedDiscussion.user'),

    (new Extend\ApiSerializer(TagSerializer::class))
        ->attribute('sleekCommentCount', function ($serializer, Tag $tag) {
            return (int) $tag->discussions()->sum('comment_count');
        }),

    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attribute('sleekDiscussionCount', function () {
            return Discussion::query()->count();
        })
        ->attribute('sleekPostCount', function () {
            return Post::query()->whereNull('hidden_at')->count();
        })
        ->attribute('sleekUserCount', function () {
            return User::query()->count();
        })
        ->attribute('sleekLatestUsername', function () {
            $user = User::query()->orderByDesc('joined_at')->first();

            return $user ? $user->username : null;
        }),
];
