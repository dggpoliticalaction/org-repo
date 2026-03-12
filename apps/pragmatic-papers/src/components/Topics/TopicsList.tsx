import { Topic } from "@/payload-types"
import { TopicBadge } from "./TopicsBadge"
import { cn } from "@/utilities/ui"

export interface TopicsListProps extends React.HTMLAttributes<HTMLElement> {
  topics: (number | Topic)[] | null | undefined
  badgeClassName?: string
}

export const TopicsList: React.FC<TopicsListProps> = ({
  topics,
  badgeClassName,
  className,
  ...props
}) => {
  if (!topics?.length) return null

  const resolvedTopics = topics.filter((topic): topic is Topic => typeof topic === 'object')

  if (!resolvedTopics.length) return null

  return (
    <section aria-label="Topics" className={cn('mt-6', className)} {...props}>
      <div className="flex flex-wrap gap-2">
        {resolvedTopics.map((topic) => (
          <TopicBadge key={topic.id} topic={topic} className={badgeClassName} />
        ))}
      </div>
    </section>
  )
}