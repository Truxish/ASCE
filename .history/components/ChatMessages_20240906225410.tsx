import React, { Suspense } from "react"
import ListMessages from "./ListMessages"
import { supabaseServer } from "@/lib/supabase/server"
import InitMessages from "@/lib/store/InitMessages"
import { LIMIT_MESSAGE } from "@/lib/constant"
import { Imessage } from "../lib/store/messages" // Make sure to import Imessage type

export default async function ChatMessages() {
  const supabase = supabaseServer()

  const { data } = await supabase
    .from("messages")
    .select("*, users(*)")
    .range(0, LIMIT_MESSAGE)
    .order("created_at", { ascending: false })

  // Transform the data to match Imessage type
  const messages: Imessage[] = data
    ? data.map((item: any) => ({
        created_at: item.created_at,
        id: item.id,
        is_edit: item.is_edit,
        send_by: item.send_by,
        text: item.text,
        users: item.users
          ? {
              avatar_url: item.users.avatar_url,
              created_at: item.users.created_at,
              display_name: item.users.display_name,
              id: item.users.id,
            }
          : null,
      }))
    : []

  return (
    <Suspense fallback={"loading.."}>
      <ListMessages />
      <InitMessages messages={messages.reverse()} />
    </Suspense>
  )
}