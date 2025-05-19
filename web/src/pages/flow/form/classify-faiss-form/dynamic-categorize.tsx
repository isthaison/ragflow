import { useTranslate } from '@/hooks/common-hooks';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useUpdateNodeInternals } from '@xyflow/react';
import {
  Button,
  Collapse,
  Flex,
  Form,
  FormListFieldData,
  Input,
  Select,
} from 'antd';
import { FormInstance } from 'antd/lib';
import { humanId } from 'human-id';
import trim from 'lodash/trim';
import {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Operator } from '../../constant';
import { useBuildFormSelectOptions } from '../../form-hooks';
import { useHandleFormValuesChange } from './hooks';

interface IProps {
  nodeId?: string;
  onValuesChange?: (changedValues: any, allValues: any) => void;
}

interface INameInputProps {
  value?: string;
  onChange?: (value: string) => void;
  otherNames?: string[];
  validate(errors: string[]): void;
}

const getOtherFieldValues = (
  form: FormInstance,
  formListName: string = 'items',
  field: FormListFieldData,
  latestField: string,
) =>
  (form.getFieldValue([formListName]) ?? [])
    .map((x: any) => x[latestField])
    .filter(
      (x: string) =>
        x !== form.getFieldValue([formListName, field.name, latestField]),
    );

const NameInput = ({
  value,
  onChange,
  otherNames,
  validate,
}: INameInputProps) => {
  const [name, setName] = useState<string | undefined>();
  const { t } = useTranslate('flow');

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const val = e.target.value;
      if (otherNames?.some((x) => x === val)) {
        validate([t('nameRepeatedMsg')]);
      } else if (trim(val) === '') {
        validate([t('nameRequiredMsg')]);
      } else {
        validate([]);
      }
      setName(val);
    },
    [otherNames, validate, t],
  );

  const handleNameBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const val = e.target.value;
      if (otherNames?.every((x) => x !== val) && trim(val) !== '') {
        onChange?.(val);
      }
    },
    [onChange, otherNames],
  );

  useEffect(() => {
    setName(value);
  }, [value]);

  return (
    <Input
      value={name}
      onChange={handleNameChange}
      onBlur={handleNameBlur}
    ></Input>
  );
};

const FormSet = ({ nodeId, field }: IProps & { field: FormListFieldData }) => {
  const form = Form.useFormInstance();
  const { t } = useTranslate('flow');
  const buildCategorizeToOptions = useBuildFormSelectOptions(
    Operator.ClassifyFaiss,
    nodeId,
  );

  return (
    <section>
      <Form.Item
        label={t('categoryName')}
        name={[field.name, 'name']}
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          {
            required: true,
            whitespace: true,
            message: t('nameMessage'),
          },
        ]}
      >
        <NameInput
          otherNames={getOtherFieldValues(form, 'items', field, 'name')}
          validate={(errors: string[]) =>
            form.setFields([
              {
                name: ['items', field.name, 'name'],
                errors,
              },
            ])
          }
        ></NameInput>
      </Form.Item>
      <Form.Item label={t('description')} name={[field.name, 'description']}>
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item label={t('nextStep')} name={[field.name, 'to']}>
        <Select
          showSearch
          allowClear
          options={buildCategorizeToOptions(
            getOtherFieldValues(form, 'items', field, 'to'),
          )}
        />
      </Form.Item>
      <Form.Item hidden name={[field.name, 'index']}>
        <Input />
      </Form.Item>
    </section>
  );
};

// Add DefaultCategorySelector component
export const DefaultCategorySelector = () => {
  const form = Form.useFormInstance();
  const { t } = useTranslate('flow');
  const [categories, setCategories] = useState<string[]>([]);

  // Watch for changes in the items field to update category options
  useEffect(() => {
    const items = form.getFieldValue('items') || [];
    const categoryNames = items
      .map((item: any) => item?.name)
      .filter(Boolean)
      .map((name: string) => name.trim())
      .filter((name: string) => name !== '');

    setCategories(categoryNames);
  }, [form]);

  return (
    <Form.Item
      name="default_category"
      label={t('defaultCategory', { defaultValue: 'Default Category' })}
    >
      <Select
        showSearch
        allowClear
        placeholder={t('selectDefaultCategory', {
          defaultValue: 'Select default category',
        })}
        options={categories.map((category) => ({
          label: category,
          value: category,
        }))}
      />
    </Form.Item>
  );
};

const DynamicCategorize = ({ nodeId, onValuesChange }: IProps) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const form = Form.useFormInstance();
  const { t } = useTranslate('flow');

  // Get handleValuesChange from the hook
  const { handleValuesChange } = useHandleFormValuesChange({
    form,
    nodeId,
    onValuesChange,
  });

  return (
    <>
      <Form.List name="items">
        {(fields, { add, remove }) => {
          const handleAdd = () => {
            const idx = form.getFieldValue([
              'items',
              fields.at(-1)?.name,
              'index',
            ]);
            add({
              name: humanId(),
              index: fields.length === 0 ? 0 : idx + 1,
            });
            if (nodeId) updateNodeInternals(nodeId);
          };

          // Sort fields by index
          const sortedFields = [...fields].sort((a, b) => {
            const indexA = form.getFieldValue(['items', a.name, 'index']) || 0;
            const indexB = form.getFieldValue(['items', b.name, 'index']) || 0;
            return indexA - indexB;
          });

          // Function to move a category up
          const moveUp = (field: FormListFieldData) => {
            const allItems = form.getFieldValue('items') || [];
            const currentItem = allItems[field.name];

            // Sort items by index
            const sortedItems = [...allItems]
              .map((item: any, idx: number) => ({ ...item, arrayIndex: idx }))
              .sort((a: any, b: any) => (a.index || 0) - (b.index || 0));

            // Find current item position in sorted array
            const currentSortedIndex = sortedItems.findIndex(
              (item: any) => item.arrayIndex === field.name,
            );

            // If already at the top, do nothing
            if (currentSortedIndex <= 0) return;

            // Get the item above in sorted order
            const prevItem = sortedItems[currentSortedIndex - 1];

            // Swap indices
            const updatedItems = allItems.map((item: any, idx: number) => {
              if (idx === field.name) {
                return { ...item, index: prevItem.index };
              }
              if (idx === prevItem.arrayIndex) {
                return { ...item, index: currentItem.index };
              }
              return item;
            });

            // Update form with new values
            form.setFieldsValue({ items: updatedItems });

            // Force the node to update
            if (nodeId) {
              setTimeout(() => {
                updateNodeInternals(nodeId);
              }, 0);
            }

            // Trigger form values change to propagate to node data
            form.validateFields(['items']).then(() => {
              const values = form.getFieldsValue();
              handleValuesChange(values, values);
            });
          };

          // Function to move a category down
          const moveDown = (field: FormListFieldData) => {
            const allItems = form.getFieldValue('items') || [];
            const currentItem = allItems[field.name];

            // Sort items by index
            const sortedItems = [...allItems]
              .map((item: any, idx: number) => ({ ...item, arrayIndex: idx }))
              .sort((a: any, b: any) => (a.index || 0) - (b.index || 0));

            // Find current item position in sorted array
            const currentSortedIndex = sortedItems.findIndex(
              (item: any) => item.arrayIndex === field.name,
            );

            // If already at the bottom, do nothing
            if (currentSortedIndex >= sortedItems.length - 1) return;

            // Get the item below in sorted order
            const nextItem = sortedItems[currentSortedIndex + 1];

            // Swap indices
            const updatedItems = allItems.map((item: any, idx: number) => {
              if (idx === field.name) {
                return { ...item, index: nextItem.index };
              }
              if (idx === nextItem.arrayIndex) {
                return { ...item, index: currentItem.index };
              }
              return item;
            });

            // Update form with new values
            form.setFieldsValue({ items: updatedItems });

            // Force the node to update
            if (nodeId) {
              setTimeout(() => {
                updateNodeInternals(nodeId);
              }, 0);
            }

            // Trigger form values change to propagate to node data
            form.validateFields(['items']).then(() => {
              const values = form.getFieldsValue();
              handleValuesChange(values, values);
            });
          };

          return (
            <Flex gap={18} vertical>
              {sortedFields.map((field) => (
                <Collapse
                  size="small"
                  key={field.key}
                  items={[
                    {
                      key: field.key,
                      label: (
                        <div className="flex justify-between w-full">
                          <span>
                            {form.getFieldValue(['items', field.name, 'name'])}
                          </span>
                          <div className="flex items-center gap-2">
                            <ArrowUpOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                moveUp(field);
                              }}
                              className="cursor-pointer"
                            />
                            <ArrowDownOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDown(field);
                              }}
                              className="cursor-pointer"
                            />
                            <CloseOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                remove(field.name);
                              }}
                            />
                          </div>
                        </div>
                      ),
                      children: (
                        <FormSet nodeId={nodeId} field={field}></FormSet>
                      ),
                    },
                  ]}
                ></Collapse>
              ))}

              <Button
                type="dashed"
                onClick={handleAdd}
                block
                icon={<PlusOutlined />}
              >
                {t('addCategory')}
              </Button>
            </Flex>
          );
        }}
      </Form.List>
    </>
  );
};

export default DynamicCategorize;
