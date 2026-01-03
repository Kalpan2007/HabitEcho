import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

/**
 * Root page - Redirects to login
 * Server Component
 */
export default function HomePage() {
  redirect(ROUTES.LOGIN);
}
