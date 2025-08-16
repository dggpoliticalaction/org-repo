'use client'
import React, { useCallback, useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TextFieldClientProps } from 'payload'

import {
  useField,
  Button,
  TextInput,
  FieldLabel,
  useFormFields,
  useForm,
  useDocumentInfo,
} from '@payloadcms/ui'

import { formatSlug } from './formatSlug'
import './index.scss'

type SlugComponentProps = {
  fieldToUse: string
  checkboxFieldPath: string
} & TextFieldClientProps

export const SlugComponent: React.FC<SlugComponentProps> = ({
  field,
  fieldToUse,
  checkboxFieldPath: checkboxFieldPathFromProps,
  path,
  readOnly: readOnlyFromProps,
}) => {
  const { label } = field

  const checkboxFieldPath = path?.includes('.')
    ? `${path}.${checkboxFieldPathFromProps}`
    : checkboxFieldPathFromProps

  const { value, setValue } = useField<string>({ path: path || field.name })
  const { dispatchFields } = useForm()
  const documentInfo = useDocumentInfo()
  const isPublished = documentInfo?.hasPublishedDoc

  // The value of the checkbox
  // We're using separate useFormFields to minimise re-renders
  const checkboxValue = useFormFields(([fields]) => {
    return fields[checkboxFieldPath]?.value as string
  })

  // The value of the field we're listening to for the slug
  const targetFieldValue = useFormFields(([fields]) => {
    return fields[fieldToUse]?.value as string
  })

  useEffect(() => {
    if (!isPublished && checkboxValue) {
      if (targetFieldValue) {
        const formattedSlug = formatSlug(targetFieldValue)

        if (value !== formattedSlug) setValue(formattedSlug)
      } else {
        if (value !== '') setValue('')
      }
    }
  }, [targetFieldValue, checkboxValue, setValue, value, isPublished])

  const handleLock = useCallback(
    (e: React.MouseEvent<Element>) => {
      e.preventDefault()

      if (!isPublished) {
        dispatchFields({
          type: 'UPDATE',
          path: checkboxFieldPath,
          value: !checkboxValue,
        })
      }
    },
    [checkboxValue, checkboxFieldPath, dispatchFields, isPublished],
  )

  const readOnly = readOnlyFromProps || checkboxValue || isPublished

  return (
    <div className="field-type slug-field-component">
      <div className="label-wrapper">
        <FieldLabel htmlFor={`field-${path}`} label={label} />

        <Button
          className="lock-button"
          buttonStyle="none"
          onClick={handleLock}
          disabled={isPublished}
        >
          {isPublished ? 'Locked (Published)' : checkboxValue ? 'Unlock' : 'Lock'}
        </Button>
      </div>

      <TextInput
        value={value}
        onChange={setValue}
        path={path || field.name}
        readOnly={Boolean(readOnly)}
      />
    </div>
  )
}
