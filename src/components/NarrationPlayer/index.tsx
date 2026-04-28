"use client"

import type { Narration } from "@/payload-types"
import { Pause, Play } from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"

import { Slider } from "@/components/ui/slider"

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`
}

function buildWebVTT(transcript: string, duration: number): string {
  const segments = transcript
    .split(/\n\n+/)
    .map((s) => s.replace(/\n/g, " ").trim())
    .filter(Boolean)

  if (segments.length === 0) return "WEBVTT\n"

  const segmentDuration = duration / segments.length
  const cues = segments.map((text, i) => {
    const start = formatVTTTime(i * segmentDuration)
    const end = formatVTTTime((i + 1) * segmentDuration)
    return `${start} --> ${end}\n${text}`
  })

  return `WEBVTT\n\n${cues.join("\n\n")}`
}

export function NarrationPlayer({ narration }: { narration: Narration }): React.ReactNode {
  const audioRef = useRef<HTMLAudioElement>(null)
  const durationRef = useRef(narration.duration ?? 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(narration.duration ?? 0)
  const [captionSrc, setCaptionSrc] = useState("")

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let seeking = false

    const onTimeUpdate = () => {
      if (seeking) return
      setCurrentTime(audio.currentTime)
    }
    const onDurationChange = () => {
      if (!isFinite(audio.duration)) return
      durationRef.current = audio.duration
      setDuration(audio.duration)
      if (seeking) {
        seeking = false
        audio.currentTime = 0
      }
    }
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(durationRef.current)
    }

    const tryCaptureDuration = () => {
      if (isFinite(audio.duration)) {
        durationRef.current = audio.duration
        setDuration(audio.duration)
      } else if (durationRef.current === 0) {
        // No stored duration and header reports Infinity — seek past end to
        // force the browser to find the real end and re-fire durationchange.
        seeking = true
        audio.currentTime = 1e9
      }
    }

    if (audio.readyState >= 1) tryCaptureDuration()

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("durationchange", onDurationChange)
    audio.addEventListener("loadedmetadata", tryCaptureDuration)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("durationchange", onDurationChange)
      audio.removeEventListener("loadedmetadata", tryCaptureDuration)
      audio.removeEventListener("ended", onEnded)
    }
  }, [])

  useEffect(() => {
    if (duration <= 0 || !narration.transcript) return
    const vtt = buildWebVTT(narration.transcript, duration)
    const blob = new Blob([vtt], { type: "text/vtt" })
    const url = URL.createObjectURL(blob)
    setCaptionSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [duration, narration.transcript])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }, [isPlaying])

  const handleSeek = useCallback((value: number | readonly number[]) => {
    const audio = audioRef.current
    const newTime = Array.isArray(value) ? value[0] : value
    if (!audio || newTime === undefined) return
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  if (!narration.url) return null

  return (
    <div className="flex flex-col gap-1.5">
      {narration.narrator && typeof narration.narrator !== "number" && (
        <p className="text-muted-foreground font-serif text-sm">
          Narrated by{" "}
          <a href={`/authors/${narration.narrator.slug}`} className="hover:underline">
            {narration.narrator.name}
          </a>
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause narration" : "Play narration"}
          className="text-primary hover:text-primary/70 shrink-0 transition-colors"
        >
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <Slider
          min={0}
          max={duration || 100}
          value={[currentTime]}
          onValueChange={handleSeek}
          aria-label="Seek"
        />
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {`${formatTime(currentTime)} / ${formatTime(duration)}`}
        </span>
      </div>
      <audio ref={audioRef} src={narration.url} preload="metadata">
        <track
          key={captionSrc}
          kind="captions"
          src={captionSrc || undefined}
          default={!!captionSrc}
        />
      </audio>
    </div>
  )
}
