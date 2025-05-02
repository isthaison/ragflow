import { Form, InputNumber, Select } from 'antd';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export const MESSAGE_ROLES = [
  { label: 'User', value: 'user' },
  { label: 'Assistant', value: 'assistant' },
  { label: 'System', value: 'system' },
];

const MessageHistoryWindowSizeItem = ({
  initialValue,
}: {
  initialValue: number;
}) => {
  const { t } = useTranslation();

  return (
    <Form.Item
      name={'message_history_window_size'}
      label={t('flow.messageHistoryWindowSize')}
      initialValue={initialValue}
      tooltip={t('flow.messageHistoryWindowSizeTip')}
    >
      <InputNumber style={{ width: '100%' }} />
    </Form.Item>
  );
};

export const MessageHistoryRoleFilterItem = ({
  initialValue = [],
}: {
  initialValue?: string[];
}) => {
  const { t } = useTranslation();

  return (
    <Form.Item
      name={'message_history_role_filter'}
      label={t('flow.messageHistoryRoleFilter', 'Message Roles Filter')}
      initialValue={initialValue}
      tooltip={t(
        'flow.messageHistoryRoleFilterTip',
        'Select roles to filter messages',
      )}
    >
      <Select
        mode="multiple"
        allowClear
        options={MESSAGE_ROLES}
        placeholder={t(
          'flow.messageHistoryRoleFilterPlaceholder',
          'Select roles',
        )}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );
};

export default MessageHistoryWindowSizeItem;

export function MessageHistoryWindowSizeFormField() {
  const form = useFormContext();
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name={'message_history_window_size'}
      render={({ field }) => (
        <FormItem>
          <FormLabel tooltip={t('flow.messageHistoryWindowSizeTip')}>
            {t('flow.messageHistoryWindowSize')}
          </FormLabel>
          <FormControl>
            <Input {...field} type={'number'}></Input>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
