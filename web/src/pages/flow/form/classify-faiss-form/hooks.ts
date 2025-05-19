import {
  ICategorizeItem,
  ICategorizeItemResult,
} from '@/interfaces/database/flow';
import omit from 'lodash/omit';
import { useCallback } from 'react';
import { IOperatorForm } from '../../interface';

const buildCategorizeObjectFromList = (list: Array<ICategorizeItem>) => {
  // Ensure we have a deep copy of the list
  const sortedList = JSON.parse(JSON.stringify(list));

  // Sort by index - ensure all items have an index value
  sortedList.sort((a: ICategorizeItem, b: ICategorizeItem) => {
    const indexA = typeof a.index === 'number' ? a.index : 0;
    const indexB = typeof b.index === 'number' ? b.index : 0;
    return indexA - indexB;
  });

  // Fix the TypeScript error by properly typing the reducer function parameters
  const items = sortedList.reduce(
    (pre: ICategorizeItemResult, cur: ICategorizeItem) => {
      if (cur?.name) {
        pre[`${cur.name}`.trim()] = {
          ...omit(cur, 'name'),
          // Ensure index is always preserved
          index: typeof cur.index === 'number' ? cur.index : 0,
        };
      }
      return pre;
    },
    {} as ICategorizeItemResult,
  );

  return items;
};

export const useHandleFormValuesChange = ({
  onValuesChange,
}: IOperatorForm) => {
  const handleValuesChange = useCallback(
    (changedValues: any, values: any) => {
      // Process and update values
      const updatedValues = {
        ...omit(values, 'items'),
        category_description: buildCategorizeObjectFromList(values.items || []),
        default_category: values.default_category,
      };

      onValuesChange?.(changedValues, updatedValues);
    },
    [onValuesChange],
  );

  return { handleValuesChange };
};
