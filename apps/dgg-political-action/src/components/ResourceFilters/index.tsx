'use client'

import React, { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ResourceCategory } from '@/payload-types'

const resourceTypeOptions = [
  { label: 'Documents', value: 'document' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Links', value: 'link' },
]

export const ResourceFilters: React.FC<{
  className?: string
  categories?: ResourceCategory[]
}> = ({ className, categories = [] }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse comma-separated values from URL
  const currentTypes = searchParams.get('type')?.split(',').filter(Boolean) || []
  const currentCategories = searchParams.get('category')?.split(',').filter(Boolean) || []

  const updateFilter = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (values.length > 0) {
        params.set(key, values.join(','))
      } else {
        params.delete(key)
      }
      router.push(`/resources?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const toggleType = (value: string) => {
    const newTypes = currentTypes.includes(value)
      ? currentTypes.filter((t) => t !== value)
      : [...currentTypes, value]
    updateFilter('type', newTypes)
  }

  const toggleCategory = (slug: string) => {
    const newCategories = currentCategories.includes(slug)
      ? currentCategories.filter((c) => c !== slug)
      : [...currentCategories, slug]
    updateFilter('category', newCategories)
  }

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      <div>
        <p className="text-sm font-medium mb-2">Resource Type</p>
        <div className="flex flex-wrap gap-2">
          {resourceTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleType(option.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                currentTypes.includes(option.value)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.slug || '')}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  currentCategories.includes(category.slug || '')
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
