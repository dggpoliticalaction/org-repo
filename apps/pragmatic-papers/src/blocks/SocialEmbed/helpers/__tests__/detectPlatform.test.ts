import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'

import { detectPlatform } from '@/blocks/SocialEmbed/helpers/detectPlatform'

describe('detectPlatform', () => {
  it('detects supported platforms across known hostnames', () => {
    assert.equal(detectPlatform('https://www.twitter.com/user/status/1'), 'twitter')
    assert.equal(detectPlatform('https://x.com/user/status/1'), 'twitter')
    assert.equal(detectPlatform('https://m.youtube.com/watch?v=abc123'), 'youtube')
    assert.equal(detectPlatform('https://youtu.be/abc123'), 'youtube')
    assert.equal(detectPlatform('https://bsky.app/profile/user/post/1'), 'bluesky')
    assert.equal(detectPlatform('https://amp.reddit.com/r/test/comments/abc/post'), 'reddit')
    assert.equal(detectPlatform('https://new.reddit.com/r/test/comments/abc/post'), 'reddit')
    assert.equal(detectPlatform('https://www.tiktok.com/@u/video/123456'), 'tiktok')
  })

  it('returns null for invalid or unsupported urls', () => {
    assert.equal(detectPlatform(''), null)
    assert.equal(detectPlatform('not-a-url'), null)
    assert.equal(detectPlatform('https://example.com/foo'), null)
    assert.equal(detectPlatform('ftp://twitter.com/user/status/1'), null)
  })
})
