import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="flex w-full max-w-[360px] flex-col gap-5">
        <h1 className="m-0 font-serif text-4xl font-semibold">Admin Ruang Senja</h1>
        <LoginForm />
      </div>
    </main>
  );
}
