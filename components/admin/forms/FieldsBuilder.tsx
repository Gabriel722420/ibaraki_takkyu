'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FormField, FormFieldType } from '@/lib/types'
import { FIELD_TYPE_LABEL, FIELD_TYPES, hasOptions } from './fieldTypes'
import {
  addField,
  updateField,
  deleteField,
  reorderFields,
} from '@/app/admin/(panel)/forms/actions'

export function FieldsBuilder({
  formId,
  fields,
}: {
  formId: string
  fields: FormField[]
}) {
  const router = useRouter()
  const [order, setOrder] = useState(fields.map((f) => f.id))
  const [addType, setAddType] = useState<FormFieldType>('text')
  const [, start] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor))

  // props が更新されたら並びを同期
  const currentIds = fields.map((f) => f.id).join(',')
  const [seen, setSeen] = useState(currentIds)
  if (seen !== currentIds) {
    setSeen(currentIds)
    setOrder(fields.map((f) => f.id))
  }

  const byId = new Map(fields.map((f) => [f.id, f]))
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as FormField[]

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id as string)
    const newIndex = order.indexOf(over.id as string)
    const next = arrayMove(order, oldIndex, newIndex)
    setOrder(next)
    start(async () => {
      try {
        await reorderFields({ formId, orderedIds: next })
        router.refresh()
      } catch {
        toast.error('並べ替えの保存に失敗しました。')
      }
    })
  }

  function add() {
    start(async () => {
      try {
        await addField({ formId, fieldType: addType })
        router.refresh()
        toast.success('項目を追加しました')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '追加に失敗しました。')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">追加する項目</Label>
          <Select
            value={addType}
            onValueChange={(v) => setAddType(v as FormFieldType)}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {FIELD_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" onClick={add}>
          <Plus /> 項目を追加
        </Button>
      </div>

      {ordered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          まだ項目がありません。上の「項目を追加」から作成してください。
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ordered.map((f) => (
                <FieldCard key={f.id} field={f} formId={formId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function FieldCard({ field, formId }: { field: FormField; formId: string }) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })
  const [label, setLabel] = useState(field.label)
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? '')
  const [required, setRequired] = useState(field.required)
  const [optionsText, setOptionsText] = useState((field.options ?? []).join('\n'))
  const [busy, start] = useTransition()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  function save() {
    start(async () => {
      try {
        await updateField({
          id: field.id,
          formId,
          values: {
            label,
            placeholder,
            required,
            options: optionsText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          },
        })
        router.refresh()
        toast.success('保存しました')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '保存に失敗しました。')
      }
    })
  }

  function remove() {
    start(async () => {
      try {
        await deleteField({ id: field.id, formId })
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '削除に失敗しました。')
      }
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-card p-3"
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="ドラッグで並べ替え"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <Badge variant="outline">{FIELD_TYPE_LABEL[field.field_type]}</Badge>
        <div className="flex-1" />
        <label className="flex items-center gap-1.5 text-sm">
          <Switch checked={required} onCheckedChange={setRequired} />
          必須
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">ラベル</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">
            プレースホルダ（任意）
          </Label>
          <Input
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
          />
        </div>
      </div>

      {hasOptions(field.field_type) && (
        <div className="mt-2 grid gap-1">
          <Label className="text-xs text-muted-foreground">
            選択肢（1行に1つ）
          </Label>
          <Textarea
            rows={3}
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder={'例：\n男子\n女子'}
          />
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" onClick={save} disabled={busy}>
          保存
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={remove}
          disabled={busy}
        >
          <Trash2 /> 削除
        </Button>
      </div>
    </div>
  )
}
