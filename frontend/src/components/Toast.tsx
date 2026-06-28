import { App } from 'antd';

type ToastKind = 'success' | 'error';

export function useToast() {
  const { message } = App.useApp();
  return {
    notify: (kind: ToastKind, text: string) => {
      if (kind === 'success') message.success(text);
      else message.error(text);
    },
  };
}
