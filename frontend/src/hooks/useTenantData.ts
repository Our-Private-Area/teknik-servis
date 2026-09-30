import { useMemo } from 'react';
import { useTenantStore } from '../store/tenantStore';
import { useServiceStore } from '../store/serviceStore';
import { useCustomerStore } from '../store/customerStore';
import { useStockStore } from '../store/stockStore';
import { useCashStore } from '../store/cashStore';
import { useStaffStore } from '../store/staffStore';

/**
 * Check if a record belongs to the target tenant.
 * 'tenant-default' and 'demo-servis' match records with default tenant or empty/undefined tenantId.
 */
export function isMatchingTenant(itemTenantId: string | undefined, currentTenantId: string): boolean {
  const isDefaultTenant = currentTenantId === 'tenant-default' || currentTenantId === 'demo-servis';
  if (isDefaultTenant) {
    return !itemTenantId || itemTenantId === 'tenant-default' || itemTenantId === 'demo-servis';
  }
  return itemTenantId === currentTenantId;
}

export function useTenantServices() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const allServices = useServiceStore((s) => s.services);
  return useMemo(() => {
    return allServices.filter((s) => isMatchingTenant(s.tenantId, currentTenant.id));
  }, [allServices, currentTenant.id]);
}

export function useTenantCustomers() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const allCustomers = useCustomerStore((s) => s.customers);
  return useMemo(() => {
    return allCustomers.filter((c) => isMatchingTenant(c.tenantId, currentTenant.id));
  }, [allCustomers, currentTenant.id]);
}

export function useTenantStock() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const allStock = useStockStore((s) => s.items);
  return useMemo(() => {
    return allStock.filter((item) => isMatchingTenant(item.tenantId, currentTenant.id));
  }, [allStock, currentTenant.id]);
}

export function useTenantCash() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const allTx = useCashStore((s) => s.transactions);
  return useMemo(() => {
    return allTx.filter((t) => isMatchingTenant(t.tenantId, currentTenant.id));
  }, [allTx, currentTenant.id]);
}

export function useTenantStaff() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const allStaff = useStaffStore((s) => s.staffMembers);
  return useMemo(() => {
    return allStaff.filter((m) => isMatchingTenant(m.tenantId, currentTenant.id));
  }, [allStaff, currentTenant.id]);
}
