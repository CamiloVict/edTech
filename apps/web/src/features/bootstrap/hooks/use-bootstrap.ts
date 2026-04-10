'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bootstrapQueryKey,
  fetchBootstrap,
  setUserRole,
  syncUser,
} from '@/features/bootstrap/api/bootstrap-api';

export function useBootstrapQuery() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });
}

export function useSyncMutation() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => syncUser(getToken),
    onSuccess: (data) => {
      qc.setQueryData(bootstrapQueryKey, data.bootstrap);
    },
  });
}

export function useSetRoleMutation() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: 'CONSUMER' | 'PROVIDER') =>
      setUserRole(getToken, role),
    onSuccess: (bootstrap) => {
      qc.setQueryData(bootstrapQueryKey, bootstrap);
    },
  });
}
