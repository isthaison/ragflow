import MessageHistoryWindowSizeItem from '@/components/message-history-window-size-item';
import { Form, Input, InputNumber, Slider, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { IOperatorForm } from '../../interface';
import DynamicInputVariable from '../components/dynamic-input-variable';
import DynamicCategorize, {
  DefaultCategorySelector,
} from './dynamic-categorize';
import { useHandleFormValuesChange } from './hooks';

const ClassifyFaissForm = ({ form, onValuesChange, node }: IOperatorForm) => {
  const { handleValuesChange } = useHandleFormValuesChange({
    form,
    nodeId: node?.id,
    onValuesChange,
  });
  const { t } = useTranslation();

  return (
    <Form
      name="basic"
      autoComplete="off"
      form={form}
      onValuesChange={handleValuesChange}
      initialValues={{
        items: [{}],
        keyword_weight: 0.5,
        similarity_threshold: 0.7,
        k: 5,
        deep_zone: false,
        url: '',
        pathzone: '',
        default_category: '',
      }}
      layout={'vertical'}
    >
      <Form.Item name={'url'} label={t('flow.url')}>
        <Input />
      </Form.Item>
      <Form.Item name={'pathzone'} label={t('flow.classifyFaissForm.pathzone')}>
        <Input />
      </Form.Item>
      <Form.Item label={t('flow.classifyFaissForm.k')} shouldUpdate>
        {({ getFieldValue, setFieldsValue }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Slider
              min={1}
              max={20}
              style={{ flex: 1 }}
              value={getFieldValue('k')}
              onChange={(value) => setFieldsValue({ k: value })}
              marks={{ 1: '1', 20: '20' }}
            />
            <InputNumber
              min={1}
              max={20}
              value={getFieldValue('k')}
              onChange={(value) => setFieldsValue({ k: value })}
              style={{ width: 70 }}
            />
          </div>
        )}
      </Form.Item>
      <Form.Item
        label={t('flow.classifyFaissForm.keyword_weight')}
        shouldUpdate
        name={'keyword_weight'}
      >
        <Slider
          step={0.01}
          min={0}
          max={1}
          style={{ flex: 1 }}
          marks={{ 0: '0', 1: '1' }}
        />
      </Form.Item>
      <Form.Item
        label={t('flow.classifyFaissForm.similarity_threshold')}
        shouldUpdate
        name={'similarity_threshold'}
      >
        <Slider
          step={0.01}
          min={0}
          max={1}
          style={{ flex: 1 }}
          marks={{ 0: '0', 1: '1' }}
        />
      </Form.Item>
      <Form.Item
        name={'deep_zone'}
        label={t('flow.classifyFaissForm.deep_zone')}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <DynamicInputVariable node={node}></DynamicInputVariable>
      <MessageHistoryWindowSizeItem initialValue={1} />
      <DynamicCategorize nodeId={node?.id}></DynamicCategorize>
      <DefaultCategorySelector />
    </Form>
  );
};

export default ClassifyFaissForm;
