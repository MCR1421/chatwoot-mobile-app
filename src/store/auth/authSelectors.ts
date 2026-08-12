import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Account } from '@/types/Account';

export const selectAuth = (state: RootState) => state.auth;

export const selectAuthHeaders = createSelector(selectAuth, auth => auth.headers);

export const selectUser = createSelector(selectAuth, auth => auth.user);

export const selectIsLoggingIn = createSelector(selectAuth, auth => auth.uiFlags.isLoggingIn);

export const selectAuthError = createSelector(selectAuth, auth => auth.error);

export const selectLoggedIn = createSelector(selectAuth, auth => auth.user !== null);

export const selectUserId = createSelector(selectAuth, auth => auth.user?.id);

export const selectPubSubToken = createSelector(selectAuth, auth => auth.user?.pubsub_token);

export const selectUserThumbnail = createSelector(selectAuth, auth => auth.user?.avatar_url);

export const selectUserName = createSelector(selectAuth, auth => auth.user?.name);

export const selectResetPasswordLoading = createSelector(
  selectAuth,
  auth => auth.uiFlags.isResettingPassword,
);

export const selectAccounts = createSelector(selectAuth, auth => auth.user?.accounts);

export const selectCurrentUserAvailability = createSelector(selectAuth, auth => {
  if (!auth.user) {
    return 'offline';
  }
  // EvoCRM is single-tenant: `accounts` always has exactly one entry (the
  // profile/availability endpoint's jbuilder hardcodes its `id` to 1, which
  // never matches the real UUID `account_id` from login) — so index [0]
  // directly instead of filtering by id.
  const {
    user: { accounts = [] },
  } = auth;
  const [currentAccount] = accounts as Account[];
  return currentAccount?.availability ?? 'offline';
});

export const selectCurrentUserAccountId = createSelector(selectAuth, auth => auth.user?.account_id);

export const selectCurrentUserAccount = createSelector(selectAuth, auth => {
  const { user } = auth;
  const currentAccount = user?.accounts?.find(
    account => Number(account.id) === Number(user?.account_id),
  );
  return currentAccount;
});

export const selectMfaToken = createSelector(selectAuth, auth => auth.mfaToken);

export const selectIsMfaRequired = createSelector(selectAuth, auth => auth.mfaToken !== null);

export const selectIsVerifyingMfa = createSelector(selectAuth, auth => auth.uiFlags.isVerifyingMfa);
