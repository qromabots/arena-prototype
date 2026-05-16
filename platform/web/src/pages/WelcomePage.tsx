import { HandleForm } from '@/components/HandleForm';
import { Layout } from '@/components/Layout';
import { setHandle } from '@/sync/LocalStore';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useLocalStore } from '@/sync/LocalStoreContext';

export function WelcomePage() {
  const navigate = useNavigate();
  const local = useLocalStore();

  useEffect(() => {
    void local.ensureKeypair();
  }, [local]);

  useEffect(() => {
    if (local.getIdentity()) {
      void navigate({ to: '/' });
    }
  }, [local, navigate]);

  return (
    <Layout title="Choose your handle">
      <HandleForm
        submitLabel="Continue"
        onSubmit={async (handle) => {
          await setHandle(handle);
          await navigate({ to: '/' });
        }}
      />
    </Layout>
  );
}
