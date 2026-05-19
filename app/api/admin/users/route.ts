import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (data?.role !== "admin") return null
  return user
}

export async function GET() {
  const caller = await verifyAdmin()
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data: { users }, error } = await getAdminClient().auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: profiles } = await getAdminClient().from("profiles").select("id, role")
  const roleMap = new Map(profiles?.map((p) => [p.id, p.role]) ?? [])

  const result = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    email_confirmed_at: u.email_confirmed_at ?? null,
    role: roleMap.get(u.id) ?? "user",
  }))

  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const caller = await verifyAdmin()
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId, role } = await req.json()
  if (!userId || !["admin", "user"].includes(role)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  if (userId === caller.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
  }

  const { error } = await getAdminClient().from("profiles").update({ role }).eq("id", userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
