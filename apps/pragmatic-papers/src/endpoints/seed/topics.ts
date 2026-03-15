import type { Topic } from "@/payload-types"
import type { Payload } from "payload"

export interface SeedTopicConfig {
	name: string
	description?: string
}

const defaultTopics: SeedTopicConfig[] = [
	{
		name: "Political",
		description: "literally a statement of fact but ok.",
	},
	{
		name: "Memes",
		description: "Research and commentary on internet culture, virality, and digital communication.",
	},
	{
		name: "Cognitive Science",
		description: "Cross-disciplinary work on mind, behavior, and the science of thought.",
	},
]

const toSlug = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")

export const createTopics = async (
	payload: Payload,
	topicsToCreate: SeedTopicConfig[] = defaultTopics,
): Promise<Topic[]> => {
	const topics: Topic[] = []

	for (const topic of topicsToCreate) {
		const createdTopic = await payload.create({
			collection: "topics",
			draft: false,
			data: {
				name: topic.name,
				description: topic.description,
				slug: toSlug(topic.name),
			},
		})
		topics.push(createdTopic)
	}

	return topics
}
