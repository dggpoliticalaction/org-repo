'use client'

import React, { useEffect, useState } from 'react'

export const AdblockDetector: React.FC<{
  header?: string
}> = (props) => {
  const { header } = props

  const [blocked, setBlocked] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      const url =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
      })
        .then(({ redirected }) => {
          if (redirected) setBlocked(true);
        })
        .catch((err) => {
          // console.log(err)
          setBlocked(window.navigator.onLine);
        });
    })()
  }, [])


  if (!blocked) return null

  const headerFromProps = header ?? 'Adblocker'

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-500 text-white z-10">
      <div className="">
        <h2>{headerFromProps}</h2>
      </div>


    </div>
  )
}
