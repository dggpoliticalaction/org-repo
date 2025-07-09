import { type ActivityType, Client, type ClientOptions, type Presence } from 'discord.js'

export class CustomClient extends Client {
  constructor(clientOptions: ClientOptions) {
    super(clientOptions)
  }

  public setPresence(
    type: Exclude<ActivityType, ActivityType.Custom>,
    name: string,
    url: string,
  ): Presence {
    if (!this.user) {
      throw new Error('Client user is not available.')
    }
    return this.user.setPresence({
      activities: [
        {
          type,
          name,
          url,
        },
      ],
    })
  }
}
