import React from "react"
import { Button } from "./ui/button"
import { supabaseBrowser } from "@/lib/supabase/browser"
import { LIMIT_MESSAGE } from "@/lib/constant"
import { getFromAndTo } from "@/lib/utils"
import { useMessage, Imessage } from "@/lib/store/messages"
import { toast } from "sonner"

export default function LoadMoreMessages() {
  const page = useMessage((state) => state.page)
  const setMesssages = useMessage((state) => state.setMesssages)
  const hasMore = useMessage((state) => state.hasMore)

  const fetchMore = async () => {
    const { from, to } = getFromAndTo(page, LIMIT_MESSAGE)

    const supabase = supabaseBrowser()

    const { data, error } = await supabase
      .from("messages")
      .select("*,users(*)")
      .range(from, to)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error(error.message)
    } else {
      // Transform the data to match Imessage type
      const transformedData: Imessage[] = data.map((item: any) => ({
        created_at: item.created_at,
        id: item.id,
        is_edit: item.is_edit,
        send_by: item.send_by,
        text: item.text,
        users: item.users && item.users.length > 0
          ? {
              avatar_url: item.users[0].avatar_url,
              created_at: item.users[0].created_at,
              display_name: item.users[0].display_name,
              id: item.users[0].id,
            }
          : null,
      }))

      setMesssages(transformedData.reverse())
    }
  }

  if (hasMore) {
    return (
      <Button variant="outline" className="w-full" onClick={fetchMore}>
        Load More
      </Button>
    )
  }
  return null
}