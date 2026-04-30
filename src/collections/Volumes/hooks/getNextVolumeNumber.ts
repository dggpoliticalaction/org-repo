import { type FieldHook, type PayloadRequest } from "payload"

const getNextVolumeNumberValue = async (req: PayloadRequest) => {
  const { payload } = req
  const volumes = await payload.find({
    collection: "volumes",
    limit: 1,
    pagination: false,
    sort: "-volumeNumber",
  })
  const highestVolumeNumber = volumes?.docs?.[0]?.volumeNumber || 0
  return highestVolumeNumber + 1
}

export const getNextVolumeNumber: FieldHook = async ({ req }) => {
  return await getNextVolumeNumberValue(req)
}

export const getDefaultTitle = async ({ req }: { req: PayloadRequest }): Promise<string> => {
  const nextVolume = await getNextVolumeNumberValue(req)
  return `Volume ${nextVolume}: `
}
