import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { HomeLanding } from './home-landing';

export default async function HomePage() {
  const a = await auth();
  if (a.userId) {
    redirect('/mi-espacio');
  }
  return <HomeLanding />;
}
