'use client'

import * as React from 'react'

const SquiggleStatic: React.FC = () => {
  return (
    <div className="bg-[url(/squiggle-static.svg)] w-full h-1 mt-6 bg-size-[auto 4px] bg-repeat-x bg-postition-[100% 100%] relative block" />
  )
}

const Squiggle: React.FC = () => {
  return (
    <div className="bg-[url(/squiggle.svg)] w-full h-1 mt-6 bg-size-[auto 4px] bg-repeat-x bg-postition-[100% 100%] relative block" />
  )
}

export { Squiggle, SquiggleStatic }
