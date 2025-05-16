import { useTranslate } from '@/hooks/common-hooks';
import { RAGFlowNodeType } from '@/interfaces/database/flow';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Collapse,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { useBuildComponentIdSelectOptions } from '../../hooks/use-get-begin-query';
import { IInvokeVariable } from '../../interface';
import { useHandleOperateParameters } from './hooks';

interface IProps {
  node?: RAGFlowNodeType;
}

const DynamicVariablesForm = ({ node }: IProps) => {
  const nodeId = node?.id;
  const { t } = useTranslate('flow');

  const options = useBuildComponentIdSelectOptions(nodeId, node?.parentId);
  // Extract Begin Input options for key dropdown
  const beginInputOptions =
    options.find((group) => group.key === 'begin')?.options || [];
  const componentOptions =
    options.find((group) => group.key !== 'begin')?.options || [];

  const {
    dataSource,
    handleAdd,
    handleRemove,
    handleValueChange,
    handleKeyChange,
  } = useHandleOperateParameters(nodeId!);

  const renderParameterItem = (item: IInvokeVariable) => (
    <Card key={item.id} bordered>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Form.Item
            label={
              <Space>
                {t('key')}
                <Tooltip title={t('keyDescription')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
          >
            <Select
              style={{ width: '100%' }}
              allowClear
              options={beginInputOptions}
              value={item.key}
              onChange={(value) => handleKeyChange(item, value)}
              placeholder={t('selectFromBeginInput')}
              showSearch
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px' }}>
                    <Input
                      value={item.key}
                      onChange={(e) => handleKeyChange(item, e.target.value)}
                      placeholder={t('enterKey')}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </>
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                {t('value')}
                <Tooltip title={t('valueDescription')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
          >
            <Select
              style={{ width: '100%' }}
              allowClear
              options={[...componentOptions]}
              value={item.value}
              onChange={(value) => handleValueChange(item, value)}
              placeholder={t('selectComponent')}
              showSearch
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px' }}>
                    <Input
                      value={item.value}
                      onChange={(e) => handleValueChange(item, e.target.value)}
                      placeholder={t('enterValue')}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </>
              )}
            />
          </Form.Item>

          <Tooltip title={t('removeParameter')}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove(item.id)}
              style={{ alignSelf: 'center', marginTop: 22 }}
            />
          </Tooltip>
        </Space>
      </Space>
    </Card>
  );

  return (
    <Collapse
      defaultActiveKey={['1']}
      items={[
        {
          key: '1',
          label: (
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Typography.Text strong>{t('parameter')}</Typography.Text>
              <Tooltip title={t('addNewParameter')}>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  {t('add')}
                </Button>
              </Tooltip>
            </Space>
          ),
          children: (
            <div style={{ padding: 12 }}>
              {dataSource.length > 0 ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: '100%' }}
                >
                  {dataSource.map(renderParameterItem)}
                </Space>
              ) : (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    background: '#fafafa',
                    borderRadius: '0 0 8px 8px',
                  }}
                >
                  <Empty
                    description={t('noParameters')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <Typography.Text
                    type="secondary"
                    style={{ marginTop: 12, display: 'block' }}
                  >
                    {t('addParametersDescription')}
                  </Typography.Text>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
};

export default DynamicVariablesForm;
