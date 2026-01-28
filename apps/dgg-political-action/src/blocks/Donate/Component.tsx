import React from 'react'
import type { DonateBlock as DonateBlockType } from '@/payload-types'

export const DonateBlock: React.FC<DonateBlockType> = ({ title, description, donationMethods }) => {
  return (
    <div className="container">
      <div className="py-16 md:py-24">
        {title && <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>}
        {description && (
          <div className="max-w-3xl mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300">{description}</p>
          </div>
        )}
        {donationMethods && donationMethods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donationMethods.map((method, index) => (
              <a
                key={index}
                href={method.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-card rounded border border-border hover:border-accent transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                  {method.label}
                </h3>
                {method.description && <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
