import { TextToSpeechClient } from "@google-cloud/text-to-speech"
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext"
import type { PayloadHandler } from "payload"

const CHUNK_SIZE = 4500

function chunkText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) ?? [text]
  const chunks: string[] = []
  let current = ""

  for (const sentence of sentences) {
    if (current.length + sentence.length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks.length ? chunks : [text.slice(0, CHUNK_SIZE)]
}

export const generateNarrationHandler: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const articleId = parseInt(req.routeParams?.id as string, 10)
  if (isNaN(articleId)) {
    return Response.json({ error: "Invalid article ID" }, { status: 400 })
  }

  if (!process.env.GOOGLE_TTS_CREDENTIALS) {
    return Response.json({ error: "GOOGLE_TTS_CREDENTIALS is not configured" }, { status: 500 })
  }

  const article = await req.payload.findByID({
    collection: "articles",
    id: articleId,
    overrideAccess: false,
    user: req.user,
  })

  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 })
  }

  const contentText = article.content ? convertLexicalToPlaintext({ data: article.content }) : ""
  const plainText = [article.title, contentText].filter(Boolean).join(". ")

  let credentials: object
  try {
    credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_TTS_CREDENTIALS, "base64").toString("utf-8"),
    )
  } catch {
    return Response.json({ error: "Failed to parse GOOGLE_TTS_CREDENTIALS" }, { status: 500 })
  }

  const client = new TextToSpeechClient({ credentials })
  const chunks = chunkText(plainText)

  const audioBuffers: Buffer[] = []
  for (const chunk of chunks) {
    const [response] = await client.synthesizeSpeech({
      input: { text: chunk },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    })
    audioBuffers.push(Buffer.from(response.audioContent as Uint8Array))
  }

  const audioBuffer = Buffer.concat(audioBuffers)

  const narration = await req.payload.create({
    collection: "narrations",
    data: {
      transcript: plainText,
    },
    file: {
      data: audioBuffer,
      mimetype: "audio/mpeg",
      name: `${article.slug}-narration.mp3`,
      size: audioBuffer.length,
    },
    overrideAccess: false,
    user: req.user,
  })

  await req.payload.update({
    collection: "articles",
    id: articleId,
    data: { narration: narration.id },
    overrideAccess: false,
    user: req.user,
  })

  return Response.json({ narrationId: narration.id })
}
