'use client'
import React, { useState } from 'react'
import { X, MegaphoneIcon } from 'lucide-react'


export interface NoticeProps {
  message?: string,
  title?: string,
  author?: string
  id?: string,
}

const defaultMessage = "lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi quis lacus vel diam tincidunt" +
  " tincidunt. Sed euismod, ante nec tincidunt imperdiet, ante nisi tincidunt mauris, quis tincidunt mauris ante quis nisi."

export const Notice: React.FC<NoticeProps> = (props) => {

  const [showNotice, setShowNotice] = useState<boolean>(true)

  const {message = defaultMessage, title = "Notice", author = "Staff"} = props


  const dismissClick = () => {
    setShowNotice(false)
  }


  if(!showNotice) return null;

  return (
    <div className="p-4 mb-4 ">
      <div className="bg-gray-800 border border-slate-400 text-white px-4 py-3 rounded relative" role="alert">

        <div className={"flex items-center justify-between gap-4"}>
          <MegaphoneIcon className={"h-6 w-6"} />
          <div>
            {title && <h3>{title}</h3>}
          </div>

          <div>
            <button type={"button"} className="" onClick={dismissClick}>
              <X className={"h-6 w-6"} />
            </button>
          </div>
        </div>

        <div className={"flex items-end justify-center"}>
          {message && <p>{message}</p>}
        </div>

        <div className={"flex items-end justify-end"}>
          {author && <p className={"text-sm"}> by {author}</p>}
        </div>

      </div>

    </div>
  )

}
