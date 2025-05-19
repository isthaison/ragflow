import { useUpdateNodeInternals } from '@xyflow/react';
import get from 'lodash/get';
import { useEffect, useMemo } from 'react';
import { SwitchElseTo } from '../../constant';

import {
  ICategorizeItemResult,
  ISwitchCondition,
  RAGFlowNodeType,
} from '@/interfaces/database/flow';
import { generateSwitchHandleText } from '../../utils';

export const useBuildCategorizeHandlePositions = ({
  data,
  id,
}: {
  id: string;
  data: RAGFlowNodeType['data'];
}) => {
  const updateNodeInternals = useUpdateNodeInternals();

  const categoryData: ICategorizeItemResult = useMemo(() => {
    return get(data, `form.category_description`, {});
  }, [data]);

  const positions = useMemo(() => {
    const list: Array<{
      text: string;
      idx: number;
    }> = [];

    // Ensure stable sorting by index
    const sortedCategories = Object.entries(categoryData)
      .map(([key, value]) => ({ key, index: value.index || 0 }))
      .sort((a, b) => a.index - b.index)
      .map((item) => item.key);

    sortedCategories.forEach((x, idx) => {
      list.push({
        text: x,
        idx,
      });
    });

    return list;
  }, [categoryData]);

  // Force update node internals when category data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateNodeInternals(id);
    }, 10);

    return () => clearTimeout(timer);
  }, [id, updateNodeInternals, categoryData]);

  return { positions };
};

export const useBuildSwitchHandlePositions = ({
  data,
  id,
}: {
  id: string;
  data: RAGFlowNodeType['data'];
}) => {
  const updateNodeInternals = useUpdateNodeInternals();

  const conditions: ISwitchCondition[] = useMemo(() => {
    return get(data, 'form.conditions', []);
  }, [data]);

  const positions = useMemo(() => {
    const list: Array<{
      text: string;
      idx: number;
      condition?: ISwitchCondition;
    }> = [];

    [...conditions, ''].forEach((x, idx) => {
      list.push({
        text:
          idx < conditions.length
            ? generateSwitchHandleText(idx)
            : SwitchElseTo,
        idx,
        condition: typeof x === 'string' ? undefined : x,
      });
    });

    return list;
  }, [conditions]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, conditions]);

  return { positions };
};
