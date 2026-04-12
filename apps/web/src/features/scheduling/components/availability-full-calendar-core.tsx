'use client';

import type {
  DateSelectArg,
  DateSpanApi,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import { useCallback, useMemo, useRef } from 'react';

export type AvailabilityBlockLike = {
  id: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezone: string;
};

export type AvailabilityFullCalendarCoreProps = {
  blocks: AvailabilityBlockLike[];
  editable?: boolean;
  onCreateRange?: (payload: {
    startsAt: string;
    endsAt: string;
    isAllDay: boolean;
  }) => void;
  onDeleteBlock?: (id: string) => void;
  /**
   * Modo familia: permite arrastrar un rango dentro de las ventanas publicadas.
   * Los bloques se pintan como fondo para no bloquear la selección.
   */
  bookingSelect?: boolean;
  onBookingSlotSelected?: (payload: {
    startsAt: string;
    endsAt: string;
  }) => void;
  /** Altura del área del calendario (p. ej. 520 o '62vh') */
  height?: number | string;
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
};

/** La API exige que la cita quede contenida en un único bloque (inicio/fin inclusivos como instantes). */
function selectionInsideSomeBlock(
  selStart: Date,
  selEnd: Date,
  blocks: AvailabilityBlockLike[],
): boolean {
  const s = selStart.getTime();
  const e = selEnd.getTime();
  if (e <= s) return false;
  return blocks.some((b) => {
    const bs = new Date(b.startsAt).getTime();
    const be = new Date(b.endsAt).getTime();
    return s >= bs && e <= be;
  });
}

function blocksToEvents(
  blocks: AvailabilityBlockLike[],
  forBookingBackground: boolean,
): EventInput[] {
  return blocks.map((b) => {
    const title = b.isAllDay ? 'Libre · día completo' : 'Horario disponible';
    const base: EventInput = forBookingBackground
      ? {
          id: b.id,
          title,
          display: 'background',
          classNames: ['availability-block-bg'],
        }
      : {
          id: b.id,
          title,
          classNames: ['availability-block-event'],
        };

    if (b.isAllDay) {
      return {
        ...base,
        allDay: true,
        start: b.startsAt,
        end: b.endsAt,
      };
    }

    return {
      ...base,
      start: b.startsAt,
      end: b.endsAt,
    };
  });
}

export function AvailabilityFullCalendarCore({
  blocks,
  editable = false,
  onCreateRange,
  onDeleteBlock,
  bookingSelect = false,
  onBookingSlotSelected,
  height = 480,
  initialView = 'dayGridMonth',
}: AvailabilityFullCalendarCoreProps) {
  const calRef = useRef<FullCalendar>(null);
  const viewTypeRef = useRef<string>(initialView);

  const bookingBg = bookingSelect && !editable;
  const events = useMemo(
    () => blocksToEvents(blocks, bookingBg),
    [blocks, bookingBg],
  );

  const selectAllow = useCallback(
    (span: DateSpanApi) => {
      if (!bookingSelect || !onBookingSlotSelected) return true;
      if (blocks.length === 0) return false;
      const vt = viewTypeRef.current;
      if (vt === 'dayGridMonth' || vt === 'listWeek') return false;
      return selectionInsideSomeBlock(span.start, span.end, blocks);
    },
    [bookingSelect, onBookingSlotSelected, blocks],
  );

  const onSelect = useCallback(
    (arg: DateSelectArg) => {
      if (bookingSelect && onBookingSlotSelected) {
        const vt = arg.view.type;
        if (vt === 'dayGridMonth' || vt === 'listWeek') {
          calRef.current?.getApi().unselect();
          return;
        }
        if (!selectionInsideSomeBlock(arg.start, arg.end, blocks)) {
          calRef.current?.getApi().unselect();
          return;
        }
        onBookingSlotSelected({
          startsAt: arg.start.toISOString(),
          endsAt: arg.end.toISOString(),
        });
        calRef.current?.getApi().unselect();
        return;
      }
      if (!editable || !onCreateRange) return;
      onCreateRange({
        startsAt: arg.start.toISOString(),
        endsAt: arg.end.toISOString(),
        isAllDay: arg.allDay,
      });
      calRef.current?.getApi().unselect();
    },
    [
      bookingSelect,
      onBookingSlotSelected,
      blocks,
      editable,
      onCreateRange,
    ],
  );

  const onEventClick = useCallback(
    (arg: EventClickArg) => {
      if (!editable || !onDeleteBlock) return;
      const id = arg.event.id;
      if (!id) return;
      const ok = window.confirm(
        '¿Eliminar esta ventana de disponibilidad? Las familias dejarán de verla en el calendario.',
      );
      if (ok) onDeleteBlock(id);
    },
    [editable, onDeleteBlock],
  );

  const selectable = editable || (bookingSelect && Boolean(onBookingSlotSelected));

  return (
    <div className="availability-fc text-stone-800">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        locale={esLocale}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          list: 'Lista',
        }}
        height={height}
        expandRows
        selectable={selectable}
        selectAllow={bookingSelect ? selectAllow : undefined}
        selectMirror
        selectOverlap={bookingSelect}
        unselectAuto={!bookingSelect}
        select={onSelect}
        datesSet={(arg) => {
          viewTypeRef.current = arg.view.type;
        }}
        eventClick={onEventClick}
        events={events}
        slotMinTime="06:00:00"
        slotMaxTime={bookingSelect ? '24:00:00' : '22:00:00'}
        slotDuration={bookingSelect ? '00:30:00' : '01:00:00'}
        snapDuration={bookingSelect ? '00:15:00' : undefined}
        allDaySlot
        nowIndicator
        dayMaxEvents={3}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
        }}
        firstDay={1}
        eventDidMount={(info) => {
          const { event } = info;
          const start = event.start;
          const end = event.end;
          if (start && end) {
            const a = start.toLocaleString('es', {
              dateStyle: 'medium',
              timeStyle: event.allDay ? undefined : 'short',
            });
            const b = end.toLocaleString('es', {
              dateStyle: 'medium',
              timeStyle: event.allDay ? undefined : 'short',
            });
            info.el.title = `${event.title}: ${a} – ${b}`;
          }
        }}
      />
    </div>
  );
}
