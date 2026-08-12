import * as Sentry from '@sentry/react-native';
import { User } from '@/types/User';
import { Account } from '@/types/Account';

export const getCurrentAccount = (user: User = {} as User): Account | undefined => {
  // EvoCRM is single-tenant: `accounts` always has exactly one entry, and
  // its `id` doesn't reliably match `user.account_id` across endpoints
  // (e.g. the profile/availability response hardcodes id 1) — so just take
  // the first (only) entry instead of filtering by id.
  const accounts = user?.accounts || [];
  return accounts[0];
};

export const getUserPermissions = (user: User): string[] => {
  try {
    const currentAccount = (getCurrentAccount(user) || {}) as Account;
    if (currentAccount.permissions?.length) {
      return currentAccount.permissions;
    }
    // EvoCRM: accounts carry a `role` object ({key: 'super_admin'|'agent'|...})
    // instead of Chatwoot's precomputed `permissions` array. Derive it.
    // `role` shape isn't consistent across EvoCRM backends: login
    // (evo-auth-service) sends `role: {key: '...'}`, but evo-crm's own
    // profile/availability endpoint sends `role` as a plain string
    // ('administrator'/'agent', see UserAttributeHelpers#role) — handle both.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRole = (currentAccount as any)?.role;
    const roleKey = typeof rawRole === 'string' ? rawRole : rawRole?.key;
    // EvoCRM's roles are `agent` | `account_owner` | `super_admin` — the
    // latter two are both elevated/full-access roles, mapped onto
    // Chatwoot's `administrator` tier.
    if (roleKey === 'super_admin' || roleKey === 'account_owner') return ['administrator'];
    if (roleKey) return [roleKey];
    return [];
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        user,
        functionName: 'getUserPermissions',
      },
    });
    return [];
  }
};
