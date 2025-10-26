export interface LoveStory {
  startDate: string // ISO date string
  partnerName: string
  title: string
}

export interface Milestone {
  id: string
  days: number
  label: string
  completed: boolean
  completedDate?: string
}

export interface LoveEvent {
  id: string
  title: string
  date: string // ISO date string
  daysUntil: number
  icon: string
}

export interface LoveStoryData {
  story: LoveStory
  milestones: Milestone[]
  events: LoveEvent[]
}
