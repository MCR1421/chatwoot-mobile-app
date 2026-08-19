import React from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, IconButton } from '@/components-next';

import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import i18n from '@/i18n';
import { openNumber, openEmail } from '@/utils/urlUtils';
import { openWhatsAppBusinessChat } from '@/utils/whatsappLauncher';
import { showToast } from '@/utils/toastUtils';

type ContactOption = {
  contactType: string;
  icon: React.ReactNode;
};

type ContactOptionProps = {
  option: ContactOption;
  handleOptionPress?: () => void;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;
const optionWidth = (count: number) => (SCREEN_WIDTH - 32 - 12 * (count - 1)) / count;

const ContactOptionComponent = (props: ContactOptionProps & { width: number }) => {
  const { option, handleOptionPress, width } = props;

  const { handlers, animatedStyle } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handleOnPress = () => {
    hapticSelection?.();
    handleOptionPress?.();
  };

  return (
    <Animated.View style={[tailwind.style('flex-1'), animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          tailwind.style(
            'flex items-center justify-center flex-1 rounded-xl bg-gray-50 py-3',
            `w-[${width}px]`,
            pressed ? 'bg-gray-100' : '',
          ),
        ]}
        onPress={handleOnPress}
        {...handlers}>
        <Icon icon={option.icon} size={24} />
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'text-cxs font-inter-medium-24 leading-[15px] tracking-[0.32px] text-center text-blue-800 pt-2',
          )}>
          {option.contactType}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

type ContactBasicActionsProps = {
  phoneNumber?: string;
  email?: string;
};

export const ContactBasicActions = (props: ContactBasicActionsProps) => {
  const { phoneNumber, email } = props;

  const onCallPress = () => {
    openNumber({ phoneNumber });
  };

  const onEmailPress = () => {
    openEmail({ email });
  };

  const onWhatsAppPress = async () => {
    if (!phoneNumber) {
      return;
    }
    try {
      await openWhatsAppBusinessChat(phoneNumber);
    } catch {
      showToast({ message: i18n.t('CONTACT_DETAILS.WHATSAPP_NOT_INSTALLED') });
    }
  };

  if (!email && !phoneNumber) {
    return null;
  }

  const options: { key: string; option: ContactOption; onPress: () => void }[] = [];

  if (email) {
    options.push({
      key: 'email',
      option: {
        contactType: i18n.t('CONTACT_DETAILS.EMAIL'),
        icon: <MailIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
      },
      onPress: onEmailPress,
    });
  }

  if (phoneNumber) {
    options.push({
      key: 'phoneNumber',
      option: {
        contactType: i18n.t('CONTACT_DETAILS.CALL'),
        icon: <PhoneIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
      },
      onPress: onCallPress,
    });
    options.push({
      key: 'whatsapp',
      option: {
        contactType: i18n.t('CONTACT_DETAILS.WHATSAPP'),
        icon: <WhatsAppIcon />,
      },
      onPress: onWhatsAppPress,
    });
  }

  if (options.length === 1) {
    return (
      <IconButton
        text={options[0].option.contactType}
        variant="secondary"
        handlePress={options[0].onPress}
      />
    );
  }

  const width = optionWidth(options.length);

  return (
    <Animated.View style={tailwind.style('flex flex-row justify-between')}>
      {options.map(({ key, option, onPress }) => (
        <ContactOptionComponent key={key} option={option} handleOptionPress={onPress} width={width} />
      ))}
    </Animated.View>
  );
};
