'use client';

import type { CSSProperties } from 'react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UserLearningPlanItem } from '@repo/educational-planner';

const sourceBadge: Record<UserLearningPlanItem['source'], string> = {
  scientific_template: 'Ciencia',
  course: 'Curso',
  custom: 'Personal',
};

function SortableItem({
  item,
  onRemove,
  onChangeTitle,
  onChangeNotes,
}: {
  item: UserLearningPlanItem;
  onRemove: (id: string) => void;
  onChangeTitle: (id: string, title: string) => void;
  onChangeNotes: (id: string, notes: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 20 : undefined,
  } as CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="flex gap-2 border-b border-border/80 px-3 py-2">
        <button
          type="button"
          className="mt-1 flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Arrastrar para reordenar"
          {...attributes}
          {...listeners}
        >
          <span className="text-lg leading-none" aria-hidden>
            ⋮⋮
          </span>
        </button>
        <div className="min-w-0 flex-1 space-y-2 py-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {sourceBadge[item.source]}
            </span>
            {item.suggestedWeeklyMinutes != null ? (
              <span className="text-[11px] text-muted-foreground">
                ~{item.suggestedWeeklyMinutes} min/sem sugeridos
              </span>
            ) : null}
          </div>
          <input
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={item.title}
            onChange={(e) => onChangeTitle(item.id, e.target.value)}
            aria-label="Título del bloque"
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="shrink-0 self-start rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          Quitar
        </button>
      </div>
      <div className="space-y-2 px-3 py-3 sm:pl-13">
        <textarea
          className="min-h-16 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Notas, acuerdos con el menor o con un educador…"
          value={item.notes ?? ''}
          onChange={(e) => onChangeNotes(item.id, e.target.value)}
          aria-label="Notas del bloque"
        />
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-primary">
            Por qué lo recomendamos
          </summary>
          <p className="mt-1.5 leading-relaxed">{item.rationale}</p>
        </details>
      </div>
    </div>
  );
}

export function PlannerRoadmap({
  items,
  onReorder,
  onRemove,
  onChangeTitle,
  onChangeNotes,
}: {
  items: UserLearningPlanItem[];
  onReorder: (activeId: string, overId: string) => void;
  onRemove: (id: string) => void;
  onChangeTitle: (id: string, title: string) => void;
  onChangeNotes: (id: string, notes: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          Tu roadmap está vacío
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Genera una sugerencia y pulsa &quot;Usar roadmap sugerido&quot;, o añade
          cursos y bloques desde el panel izquierdo.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <SortableItem
                item={item}
                onRemove={onRemove}
                onChangeTitle={onChangeTitle}
                onChangeNotes={onChangeNotes}
              />
            </li>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
