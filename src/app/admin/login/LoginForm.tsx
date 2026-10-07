'use client';

import { useActionState } from 'react';
import { login } from '../actions';

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="pw" className="text-[15px] font-semibold">Password</label>
      <input id="pw" name="password" type="password" autoComplete="current-password" className="field" aria-invalid={!!error} required />
      {error && <p className="m-0 text-sm font-semibold text-coral-300" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Masuk…' : 'Masuk'}</button>
    </form>
  );
}
