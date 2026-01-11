'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import { useFormFields } from '@payloadcms/ui'
import React from 'react'

const barClass = 'page-resource-tracker'
const BYTE_IN_KB = 1024

// Payload's default body parser limit is 1 MB.
// We set a soft limit slightly below that to avoid issues.
const SOFT_LIMIT_BYTES = 900_000

type PageResourceTrackerProps = Record<string, unknown>

const PageResourceTracker: React.FC<PageResourceTrackerProps> = (_props) => {
  const { contentField } = useFormFields(([fields]) => ({
    contentField: fields?.content,
  })) as { contentField?: { value?: unknown; initialValue?: unknown } }

  let bytesLabel = '0.0 kB'
  let percent = 0
  let severity: 'low' | 'medium' | 'high' = 'low'

  const currentValue: unknown = contentField?.value ?? contentField?.initialValue

  try {
    const json = JSON.stringify(currentValue ?? null)
    const byteLength =
      typeof TextEncoder !== 'undefined'
        ? new TextEncoder().encode(json).length
        : Buffer.from(json, 'utf8').length

    percent = Math.min(100, Math.round((byteLength / SOFT_LIMIT_BYTES) * 100))

    if (percent >= 80) severity = 'high'
    else if (percent >= 50) severity = 'medium'

    bytesLabel = `${(byteLength / BYTE_IN_KB).toFixed(1)} kB`
  } catch {
    // fall back to defaults above
  }

  const humanSoft = `${(SOFT_LIMIT_BYTES / BYTE_IN_KB).toFixed(0)} kB`

  const barColor = severity === 'high' ? '#f97373' : severity === 'medium' ? '#facc6b' : '#4ade80'

  return (
    <div
      className={barClass}
      style={{
        position: 'sticky',
        top: '1rem',
      }}
    >
      <Banner type="info">
        <div className={`${barClass}__label`}>Article size usage</div>
        <div className={`${barClass}__meta`}>
          {bytesLabel} / {humanSoft}
        </div>
        {percent >= 100 && (
          <div className={`${barClass}__warning`}>
            Size limit reached. Consider shortening the article so saves stay within the request
            limit.
          </div>
        )}
        <div
          className={`${barClass}__bar-outer`}
          style={{
            marginTop: '0.5rem',
            height: '0.5rem',
            borderRadius: '999px',
            backgroundColor: '#1f2937',
            overflow: 'hidden',
          }}
        >
          <div
            className={`${barClass}__bar-inner`}
            style={{
              width: `${percent}%`,
              height: '100%',
              transition: 'width 150ms ease-out',
              backgroundColor: barColor,
            }}
          />
        </div>
      </Banner>
    </div>
  )
}

export default PageResourceTracker
