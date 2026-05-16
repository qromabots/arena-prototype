import { zHandle, type Handle } from '@arena-prototype/shared-types';
import { useState, type FormEvent } from 'react';

type Props = {
  initialHandle?: string;
  submitLabel: string;
  onSubmit: (handle: Handle) => void | Promise<void>;
};

export function HandleForm({ initialHandle = '', submitLabel, onSubmit }: Props) {
  const [value, setValue] = useState(initialHandle);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = zHandle.safeParse(value.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid handle');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save handle');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="handle-form" onSubmit={handleSubmit}>
      <label htmlFor="handle">Choose a handle</label>
      <p className="muted">
        This name is shown to others in every arena. You can change it later in settings.
      </p>
      <input
        id="handle"
        name="handle"
        type="text"
        autoComplete="nickname"
        minLength={2}
        maxLength={24}
        pattern="[a-zA-Z0-9_-]+"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. pilot_42"
        disabled={busy}
      />
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
