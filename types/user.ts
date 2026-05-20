export interface UserRecord {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  role: "admin" | "user"
}
