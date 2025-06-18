import { useTheme } from '@/components/theme-provider';
import { IClassifyFAISSNode } from '@/interfaces/database/flow';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Divider, Flex, Tag } from 'antd';
import classNames from 'classnames';
import { RightHandleStyle } from './handle-icon';
import styles from './index.less';
import NodeHeader from './node-header';
import { useBuildCategorizeHandlePositions } from './use-build-categorize-handle-positions';

export function ClassifyFaissNode({
  id,
  data,
  selected,
}: NodeProps<IClassifyFAISSNode>) {
  const { positions } = useBuildCategorizeHandlePositions({ data, id });
  const { theme } = useTheme();

  return (
    <section
      className={classNames(
        styles.logicNode,
        theme === 'dark' ? styles.dark : '',
        {
          [styles.selectedNode]: selected,
        },
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable
        className={styles.handle}
        id={'a'}
      ></Handle>

      <NodeHeader
        id={id}
        name={data.name}
        label={data.label}
        className={styles.nodeHeader}
      ></NodeHeader>

      <Divider style={{ margin: '8px 0' }} />

      {/* Default category section with prominent styling */}
      {data.form?.default_category && (
        <div
          className={styles.defaultCategory}
          style={{
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f5f5f5',
            padding: '4px 8px',
            margin: '0 0 8px 0',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <span
            className={styles.defaultCategoryLabel}
            style={{ fontWeight: 'bold' }}
          >
            Default:
          </span>{' '}
          <Tag color="blue">{data.form.default_category}</Tag>
        </div>
      )}

      {/* Categories list */}
      <div style={{ marginTop: '4px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '4px',
            padding: '0 8px',
          }}
        >
          Categories:
        </div>
        <Flex vertical gap={8}>
          {positions.map((position, idx) => {
            return (
              <div key={idx} style={{ position: 'relative' }}>
                <div
                  className={styles.nodeText}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '4px',
                  }}
                >
                  {position.text}
                </div>
                <Handle
                  key={position.text}
                  id={position.text}
                  type="source"
                  position={Position.Right}
                  isConnectable
                  className={styles.handle}
                  style={{ ...RightHandleStyle, top: '50%', right: -10 }}
                ></Handle>
              </div>
            );
          })}
        </Flex>
      </div>
    </section>
  );
}
