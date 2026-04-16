'use client';

import { useAuth } from '@clerk/nextjs';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import {
  completeConsumerSetupIntent,
  createConsumerSetupIntent,
} from '@/features/payments/api/payments-api';
import { getStripePromise } from '@/features/payments/lib/stripe-browser';
import { ApiError } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';

function InnerForm({
  onSuccess,
}: {
  onSuccess: (setupIntentId: string) => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setBusy(true);
      setError(null);
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setError(submitErr.message ?? 'No se pudo validar el formulario');
        setBusy(false);
        return;
      }
      const { error: confirmErr, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });
      if (confirmErr) {
        setError(confirmErr.message ?? 'No se pudo confirmar el método de pago');
        setBusy(false);
        return;
      }
      const id = setupIntent?.id;
      if (!id) {
        setError('Stripe no devolvió el identificador del SetupIntent');
        setBusy(false);
        return;
      }
      try {
        await onSuccess(id);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Error al sincronizar con el servidor',
        );
      } finally {
        setBusy(false);
      }
    },
    [elements, onSuccess, stripe],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onLoadError={(e) => {
          const detail = e.error?.message ?? JSON.stringify(e.error ?? {});
          setError(
            detail && detail !== '{}'
              ? detail
              : 'No se pudo cargar el formulario de pago. Comprueba bloqueadores, la clave publicable de Stripe y que la API use la misma cuenta (test/live).',
          );
        }}
      />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={!stripe || busy}>
        {busy ? 'Guardando…' : 'Guardar tarjeta'}
      </Button>
    </form>
  );
}

export function ConsumerPaymentMethodPanel({
  hasStripeCustomer,
}: {
  hasStripeCustomer: boolean;
}) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  /** Evita montar Stripe.js durante SSR / doble hidratación (causa frecuente de loaderror). */
  const [browserReady, setBrowserReady] = useState(false);
  useEffect(() => {
    setBrowserReady(true);
  }, []);

  const setupQuery = useQuery({
    queryKey: ['payments', 'consumer', 'setup-intent'],
    queryFn: () => createConsumerSetupIntent(getToken),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const stripePromise = useMemo(() => {
    const pk = setupQuery.data?.stripePublishableKey;
    if (!pk || !browserReady) return null;
    return getStripePromise(pk);
  }, [setupQuery.data?.stripePublishableKey, browserReady]);

  const options: StripeElementsOptions | undefined = useMemo(() => {
    const clientSecret = setupQuery.data?.clientSecret;
    if (!clientSecret) return undefined;
    return {
      clientSecret,
    };
  }, [setupQuery.data?.clientSecret]);

  const onSuccess = useCallback(
    async (setupIntentId: string) => {
      await completeConsumerSetupIntent(getToken, setupIntentId);
      await qc.invalidateQueries({ queryKey: bootstrapQueryKey });
      await qc.invalidateQueries({ queryKey: ['payments', 'consumer', 'setup-intent'] });
    },
    [getToken, qc],
  );

  if (!browserReady || setupQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Preparando formulario seguro…</p>
    );
  }

  if (setupQuery.isError) {
    return (
      <p className="text-sm text-red-700">
        {setupQuery.error instanceof Error
          ? setupQuery.error.message
          : 'No se pudo iniciar el registro de tarjeta.'}
      </p>
    );
  }

  if (!stripePromise || !options) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Añade una tarjeta para que, cuando un educador confirme una clase, podamos
        autorizar el importe de la sesión y capturarlo cuando marques la clase como
        terminada. Los cobros usan Stripe; no almacenamos el número de tarjeta en
        nuestros servidores.
      </p>
      {hasStripeCustomer ? (
        <p className="text-xs font-medium text-primary">
          Ya hay una cuenta de cliente Stripe asociada. Puedes añadir o sustituir
          la tarjeta abajo.
        </p>
      ) : (
        <p className="text-xs font-medium text-amber-800">
          Añade una tarjeta: los educadores no podrán confirmar reservas contigo
          hasta que guardes un método de pago.
        </p>
      )}
      <Elements
        key={options.clientSecret}
        stripe={stripePromise}
        options={options}
      >
        <InnerForm onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
