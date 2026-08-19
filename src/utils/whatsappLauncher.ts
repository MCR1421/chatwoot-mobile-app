import { NativeModules, Platform } from 'react-native';

const { WhatsAppLauncher } = NativeModules;

export const openWhatsAppBusinessChat = async (phoneNumber: string): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  await WhatsAppLauncher.openBusinessChat(digitsOnly);
};
