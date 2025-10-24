export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface BreakLog {
  id: string
  user_id: string
  break_duration_minutes: number
  logged_at: string
  created_at: string
}

export interface BreakStats {
  totalBreaks: number
  averageInterval: number
  longestStreak: number
  weeklyData: Array<{
    day: string
    breaks: number
  }>
}
