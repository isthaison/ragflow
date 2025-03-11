import LLMSelect from '@/components/llm-select';
import MessageHistoryWindowSizeItem from '@/components/message-history-window-size-item';
import { Editor } from '@monaco-editor/react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { IOperatorForm } from '../../interface';
import DynamicInputVariable from '../components/dynamic-input-variable';

const VariableForm = ({ onValuesChange, form, node }: IOperatorForm) => {
  const { t } = useTranslation();

  return (
    <>
      <Form
        name="basic"
        autoComplete="off"
        form={form}
        onValuesChange={onValuesChange}
        layout={'vertical'}
      >
        <DynamicInputVariable node={node}></DynamicInputVariable>

        <Form.Item
          name={'llm_id'}
          label={t('model', { keyPrefix: 'chat' })}
          tooltip={t('modelTip', { keyPrefix: 'chat' })}
        >
          <LLMSelect></LLMSelect>
        </Form.Item>
        <Form.Item
          tooltip={t('flow.variablesTip')}
          name={'variables'}
          label={t('flow.variables')}
        >
          <Editor height={200} defaultLanguage="json" theme="vs-dark" />
        </Form.Item>
        <MessageHistoryWindowSizeItem
          initialValue={6}
        ></MessageHistoryWindowSizeItem>
      </Form>
    </>
  );
};

export default VariableForm;
