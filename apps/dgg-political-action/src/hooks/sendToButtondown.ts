import type { CollectionAfterChangeHook } from 'payload'

/**
 * Hook to send form submissions to Buttondown newsletter service
 * Triggers after a form submission is created
 */
export const sendToButtondown: CollectionAfterChangeHook = async ({ doc, operation }) => {
  // Only run on create operations (new submissions)
  if (operation !== 'create') {
    return doc
  }

  const buttondownApiKey = process.env.BUTTONDOWN_API_KEY

  if (!buttondownApiKey) {
    console.warn('BUTTONDOWN_API_KEY not set - skipping newsletter subscription')
    return doc
  }

  try {
    // Extract form field values
    const submissionData = doc.submissionData || []

    // Find the email and name fields from submission data
    const emailField = submissionData.find((field: any) =>
      field.field?.toLowerCase().includes('email')
    )
    const nameField = submissionData.find((field: any) =>
      field.field?.toLowerCase().includes('name')
    )
    const interestsField = submissionData.find((field: any) =>
      field.field?.toLowerCase().includes('interest')
    )

    if (!emailField?.value) {
      console.warn('No email field found in form submission')
      return doc
    }

    // Prepare tags - add "Related interests" if provided
    const tags = ['newsletter']
    if (interestsField?.value) {
      tags.push(interestsField.value)
    }

    // Prepare subscriber data
    const subscriberData: any = {
      email_address: emailField.value,
      tags: tags,
    }

    // Add name as metadata if provided
    if (nameField?.value) {
      subscriberData.metadata = {
        name: nameField.value,
      }
    }

    // Send to Buttondown API
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${buttondownApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Buttondown API error:', errorText)
      // Don't throw - we don't want to fail the form submission if newsletter signup fails
    } else {
      const result = await response.json()
      console.log('Successfully added subscriber to Buttondown:', result.email)
    }
  } catch (error) {
    console.error('Error sending to Buttondown:', error)
    // Don't throw - we don't want to fail the form submission
  }

  return doc
}
