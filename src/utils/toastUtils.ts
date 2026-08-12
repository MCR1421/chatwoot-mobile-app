import Snackbar from 'react-native-snackbar';

interface ToastParams {
  message: string;
}

export const showToast = ({ message }: ToastParams): void => {
  // Some i18n keys can resolve to a nested object instead of a string
  // (e.g. a missing/partial translation key); Snackbar's native module
  // crashes hard if `text` isn't a real string, so guard it here.
  const text = typeof message === 'string' ? message : String(message ?? '');
  Snackbar.show({
    text,
    duration: Snackbar.LENGTH_SHORT,
  });
};
