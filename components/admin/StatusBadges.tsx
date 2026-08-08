import { Badge } from '@/components/ui/badge'

export function PublishBadge({ isPublished }: { isPublished: boolean }) {
  return isPublished ? (
    <Badge className="bg-green-100 text-green-800">公開中</Badge>
  ) : (
    <Badge variant="secondary">下書き</Badge>
  )
}

export function ScheduledBadge({
  isPublished,
  publishAt,
}: {
  isPublished: boolean
  publishAt: string | null
}) {
  const scheduled =
    isPublished && !!publishAt && new Date(publishAt).getTime() > Date.now()
  if (!scheduled) return null
  return <Badge className="bg-amber-100 text-amber-800">予約中</Badge>
}
