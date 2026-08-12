import * as Sentry from '@sentry/react-native';
import { User } from '@/types/User';
import { Account } from '@/types/Account';

export const getCurrentAccount = (
  user: User = {} as User,
  accountId: number | null = null,
): Account | undefined => {
  const accounts = user?.accounts || [];
  return accounts.find(account => String(account.id) === String(accountId));
};

export const getUserPermissions = (user: User, accountId: number | null): string[] => {
  try {
    const currentAccount = (getCurrentAccount(user, accountId) || {}) as Account;
    if (currentAccount.permissions) {
      return currentAccount.permissions;
    }
    // EvoCRM: accounts carry a `role` object ({key: 'super_admin'|'agent'|...})
    // instead of Chatwoot's precomputed `permissions` array. Derive it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleKey = (currentAccount as any)?.role?.key;
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
        accountId,
        functionName: 'getUserPermissions',
      },
    });
    return [];
  }
};
