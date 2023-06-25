import type { Topic } from '../../../types'

export const filterTopics = (topics: Topic[]) => {
  const filteredOpenTopics = topics.filter((topic) => topic.status === 'OPEN')
  const filteredCompletedTopics = topics.filter(
    (topic) => topic.status === 'COMPLETED'
  )
  const filteredunreadTopics = topics.filter(
    (topic) => topic.unreadMessages > 0
  )
  const openTopics = filteredOpenTopics.sort((a, b) => {
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  })

  const completedTopics = filteredCompletedTopics.sort((a, b) => {
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  })

  const unreadTopics = filteredunreadTopics.sort((a, b) => {
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  })
  return [openTopics, completedTopics, unreadTopics]
}
