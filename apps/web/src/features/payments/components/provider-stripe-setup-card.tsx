'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import {
  createProviderConnectAccountLink,
  getProviderStripeStatus,
} from '@/features/payments/api/payments-api';
import { ApiError } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';

export function ProviderStripeSetupCard() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['payments', 'provider', 'stripe-status'],
    queryFn: () => getProviderStripeStatus(getToken),
    staleTime: 60_000,
  });

  const linkMut = useMutation({
    mutationFn: () => {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      return createProviderConnectAccountLink(getToken, {
        returnUrl: `${origin}/dashboard/provider/pagos-stripe?stripe=return`,
        refreshUrl: `${origin}/dashboard/provider/pagos-stripe?stripe=refresh`,
      });
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined' && data.url) {
        window.location.assign(data.url);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['payments', 'provider', 'stripe-status'] });
      void qc.invalidateQueries({ queryKey: bootstrapQueryKey });
    },
  });

  const errMsg = useCallback((err: unknown) => {
    if (err instanceof ApiError) return err.message;
    if (err instanceof Error) return err.message;
    return 'Error desconocido';
  }, []);

  if (statusQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        Comprobando cuenta de pagos…
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 text-sm text-red-900 shadow-sm">
        {errMsg(statusQuery.error)}
      </div>
    );
  }

  const s = statusQuery.data;
  if (!s?.needsOnboarding) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm text-emerald-950 shadow-sm">
        <p className="font-semibold">Cuenta de pagos conectada</p>
        <p className="mt-1 text-emerald-900/90">
          Cobros y transferencias con Stripe están activos para tus sesiones
          confirmadas.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
      <h2 className="text-base font-bold text-amber-950">Conecta Stripe para cobrar</h2>
      <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
        Las familias pagan con tarjeta; los importes se transfieren a tu cuenta
        conectada cuando marques la sesión como terminada. Completa el onboarding
        de Stripe (cuenta Express) para poder confirmar citas con cobro.
      </p>
      {linkMut.isError ? (
        <p className="mt-3 text-sm text-red-800">{errMsg(linkMut.error)}</p>
      ) : null}
      <Button
        type="button"
        variant="primary"
        className="mt-4"
        disabled={linkMut.isPending}
        onClick={() => linkMut.mutate()}
      >
        {linkMut.isPending ? 'Abriendo Stripe…' : 'Continuar con Stripe'}
      </Button>
    </div>
  );
}
