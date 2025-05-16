import { loader } from '@monaco-editor/react';
import { Form } from 'antd';
import { IOperatorForm } from '../../interface';
import DynamicVariablesForm from './dynamic-variables';

loader.config({ paths: { vs: '/vs' } });

export const ParametersForm = ({
  onValuesChange,
  form,
  node,
}: IOperatorForm) => {
  return (
    <>
      <Form
        name="basic"
        autoComplete="off"
        form={form}
        onValuesChange={onValuesChange}
        layout={'vertical'}
      >
        <DynamicVariablesForm node={node}></DynamicVariablesForm>
      </Form>
    </>
  );
};
