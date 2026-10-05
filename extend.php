<?php

namespace Prm\SleekDark;

use Flarum\Api\Resource\ForumResource;
use Flarum\Api\Schema;
use Flarum\Discussion\Discussion;
use Flarum\Extend;
use Flarum\Post\Post;
use Flarum\Tags\Api\Resource\TagResource;
use Flarum\Tags\Tag;
use Flarum\User\User;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\ApiResource(TagResource::class))
        ->endpoint('index', function ($endpoint) {
            return $endpoint->addDefaultInclude(['lastPostedDiscussion.user']);
        })
        ->fields(fn () => [
            Schema\Integer::make('sleekCommentCount')
                ->get(fn (Tag $tag) => (int) $tag->discussions()->sum('comment_count')),
        ]),

    (new Extend\ApiResource(ForumResource::class))
        ->fields(fn () => [
            Schema\Integer::make('sleekDiscussionCount')
                ->get(fn () => Discussion::query()->count()),
            Schema\Integer::make('sleekPostCount')
                ->get(fn () => Post::query()->whereNull('hidden_at')->count()),
            Schema\Integer::make('sleekUserCount')
                ->get(fn () => User::query()->count()),
            Schema\Str::make('sleekLatestUsername')
                ->nullable()
                ->get(function () {
                    $user = User::query()->orderByDesc('joined_at')->first();

                    return $user ? $user->username : null;
                }),
        ]),
];
