/* eslint-disable no-console */
import { type Message } from "discord.js";
import { type Trigger } from "./trigger";
import { type EventData } from "../models/internal-models";

const channelName = "call-to-action";

export class CTAPostTrigger implements Trigger {
    requireGuild: boolean;
    public triggered(msg: Message): boolean {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const ctaChannel = msg.guild?.channels.cache.find(ctaChannel => ctaChannel?.name === channelName)
        // check cta channel exists
        if (ctaChannel !== undefined) {
            
            // check message came from cta channel
            if (msg.channelId === ctaChannel.id) {
                return true
            }
        }

        return false
    }

    public async execute(msg: Message, data: EventData): Promise<void> {

        /*
        TODO
            - Create Public Thread
            - Async read reactions to message
                - Get users and roles from reactions
            - Create chart from reactions sorted by role
        */

        console.log("Message: " + msg)
        console.log("Data: " + data)
        return
    }
}