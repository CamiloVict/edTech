'use client';

import { MOCK_STUDENTS } from '@/features/educator-hub/data/educator-hub.mocks';
import { EducatorStudentsPage } from '@/features/educator-hub/presentation/views/educator-students-page';

export default function ProviderStudentsRoute() {
  return <EducatorStudentsPage students={MOCK_STUDENTS} />;
}
