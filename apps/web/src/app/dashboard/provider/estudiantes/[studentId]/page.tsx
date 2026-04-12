'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { MOCK_ROADMAPS, MOCK_STUDENTS } from '@/features/educator-hub/data/educator-hub.mocks';
import { EducatorStudentDetailPage } from '@/features/educator-hub/presentation/views/educator-student-detail-page';

export default function ProviderStudentDetailRoute() {
  const params = useParams();
  const studentId = typeof params.studentId === 'string' ? params.studentId : '';

  const student = useMemo(
    () => MOCK_STUDENTS.find((s) => s.id === studentId) ?? null,
    [studentId],
  );

  const roadmap = useMemo(() => {
    if (!student?.roadmapId) return null;
    return MOCK_ROADMAPS[student.roadmapId] ?? null;
  }, [student]);

  if (!student) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-[var(--muted-foreground)]">Estudiante no encontrado (demo).</p>
        <Link
          href="/dashboard/provider/estudiantes"
          className="text-sm font-medium text-[var(--primary-soft)] underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return <EducatorStudentDetailPage student={student} roadmap={roadmap} />;
}
