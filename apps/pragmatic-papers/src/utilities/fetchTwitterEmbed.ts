'use server'

export interface TwitterEmbedOptions {
  url: string,
  maxwidth?: number,
  hide_media?: boolean,
  hide_thread?: boolean,
  align?: 'left' | 'right' | 'center' | 'none',
  lang?: string,
  theme?: 'light' | 'dark'
}

const DEFAULT_OPTIONS: TwitterEmbedOptions = {
  url: '',
  maxwidth: 550,
  hide_media: false,
  hide_thread: false,
  align: 'none',
  lang: 'en',
  theme: 'light'
}

export async function fetchTwitterEmbed(options: TwitterEmbedOptions): Promise<any> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }
  const queryParams = new URLSearchParams({
    url: options.url,
    maxwidth: finalOptions.maxwidth!.toString(),
    hide_media: String(finalOptions.hide_media!),
    hide_thread: String(finalOptions.hide_thread!),
    align: finalOptions.align!,
    lang: finalOptions.lang!,
    theme: finalOptions.theme!,
  })
  const oembedUrl = `https://publish.twitter.com/oembed?${queryParams.toString()}`
  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      console.error(`Unable to fetch tweet: ${options.url}`)
      return null
    }
    return await res.json()
  } catch (exception) {
    console.error(exception)
    return null
  }
}
