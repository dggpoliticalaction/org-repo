import { strict as assert } from 'node:assert'
import { afterEach, describe, it } from 'node:test'

import { fetchOEmbed, OEmbedRequestError } from '@/blocks/SocialEmbed/helpers/fetchOEmbed'
import { isFailure, isSuccess } from '@/utilities/results'

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

describe('fetchOEmbed', () => {
  it('returns status-aware errors when provider responds non-2xx', async () => {
    global.fetch = (async () => {
      return new Response('nope', { status: 404, statusText: 'Not Found' })
    }) as typeof global.fetch

    const result = await fetchOEmbed(new URL('https://example.com/oembed'))
    assert.equal(isFailure(result), true)
    if (isFailure(result)) {
      assert.equal(result.error instanceof OEmbedRequestError, true)
      assert.equal((result.error as OEmbedRequestError).status, 404)
      assert.equal((result.error as OEmbedRequestError).code, 'forbidden')
    }
  })

  it('rejects invalid response shapes', async () => {
    global.fetch = (async () => {
      return new Response(JSON.stringify({ foo: 'bar' }), { status: 200 })
    }) as typeof global.fetch

    const result = await fetchOEmbed(new URL('https://example.com/oembed'))
    assert.equal(isFailure(result), true)
    if (isFailure(result)) {
      assert.equal(result.error instanceof OEmbedRequestError, true)
      assert.equal((result.error as OEmbedRequestError).code, 'invalid_oembed_response')
      assert.equal(result.error.message, 'Provider returned an invalid oEmbed response.')
    }
  })

  it('maps timeout errors to timeout code', async () => {
    global.fetch = (async () => {
      throw new DOMException('Timed out while fetching', 'TimeoutError')
    }) as typeof global.fetch

    const result = await fetchOEmbed(new URL('https://example.com/oembed'))
    assert.equal(isFailure(result), true)
    if (isFailure(result)) {
      assert.equal((result.error as OEmbedRequestError).code, 'timeout')
    }
  })

  it('maps abort errors to aborted code', async () => {
    global.fetch = (async () => {
      throw new DOMException('Request aborted', 'AbortError')
    }) as typeof global.fetch

    const result = await fetchOEmbed(new URL('https://example.com/oembed'))
    assert.equal(isFailure(result), true)
    if (isFailure(result)) {
      assert.equal((result.error as OEmbedRequestError).code, 'aborted')
    }
  })

  it('returns success for valid response shapes', async () => {
    global.fetch = (async () => {
      return new Response(JSON.stringify({ type: 'rich', html: '<blockquote>ok</blockquote>' }), {
        status: 200,
      })
    }) as typeof global.fetch

    const result = await fetchOEmbed(new URL('https://example.com/oembed'))
    assert.equal(isSuccess(result), true)
    if (isSuccess(result)) {
      assert.equal(result.value.type, 'rich')
    }
  })
})
