import { useTheme } from '@/components/theme-provider';
import { IClassifyFAISSNode } from '@/interfaces/database/flow';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Flex } from 'antd';
import classNames from 'classnames';
import { RightHandleStyle } from './handle-icon';
import { useBuildCategorizeHandlePositions } from './hooks';
import styles from './index.less';
import NodeHeader from './node-header';

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

      {data.form?.default_category && (
        <div className={styles.defaultCategory}>
          <span className={styles.defaultCategoryLabel}>Default:</span>{' '}
          {data.form?.default_category}
        </div>
      )}

      <Flex vertical gap={8}>
        {positions.map((position, idx) => {
          return (
            <div key={idx}>
              <div className={styles.nodeText}>{position.text}</div>
              <Handle
                key={position.text}
                id={position.text}
                type="source"
                position={Position.Right}
                isConnectable
                className={styles.handle}
                style={{ ...RightHandleStyle, top: position.top }}
              ></Handle>
            </div>
          );
        })}
      </Flex>
    </section>
  );
}
