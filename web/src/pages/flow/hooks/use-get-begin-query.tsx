import { RAGFlowNodeType } from '@/interfaces/database/flow';
import { DefaultOptionType } from 'antd/es/select';
import get from 'lodash/get';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BeginId, Operator } from '../constant';
import { BeginQuery } from '../interface';
import useGraphStore from '../store';

export const useGetBeginNodeDataQuery = () => {
  const getNode = useGraphStore((state) => state.getNode);

  const getBeginNodeDataQuery = useCallback(() => {
    return get(getNode(BeginId), 'data.form.query', []);
  }, [getNode]);

  return getBeginNodeDataQuery;
};

export const useGetBeginNodeDataQueryIsSafe = () => {
  const [isBeginNodeDataQuerySafe, setIsBeginNodeDataQuerySafe] =
    useState(false);
  const getBeginNodeDataQuery = useGetBeginNodeDataQuery();
  const nodes = useGraphStore((state) => state.nodes);

  useEffect(() => {
    const query: BeginQuery[] = getBeginNodeDataQuery();
    const isSafe = !query.some((q) => !q.optional && q.type === 'file');
    setIsBeginNodeDataQuerySafe(isSafe);
  }, [getBeginNodeDataQuery, nodes]);

  return isBeginNodeDataQuerySafe;
};

const ExcludedNodes = [
  Operator.Categorize,
  Operator.ClassifyFaiss,
  Operator.Relevant,
  Operator.Begin,
  Operator.Note,
];

export const useBuildComponentIdSelectOptions = (
  nodeId?: string,
  parentId?: string,
) => {
  const nodes = useGraphStore((state) => state.nodes);
  const getBeginNodeDataQuery = useGetBeginNodeDataQuery();
  const query: BeginQuery[] = getBeginNodeDataQuery();

  const filterChildNodesToSameParentOrExternal = useCallback(
    (node: RAGFlowNodeType) => {
      if (parentId) {
        return (
          (node.parentId === parentId || node.parentId === undefined) &&
          node.id !== parentId
        );
      }

      return node.parentId === undefined; // The outermost node
    },
    [parentId],
  );

  const componentIdOptions = useMemo(() => {
    return nodes
      .filter(
        (x) =>
          x.id !== nodeId &&
          !ExcludedNodes?.some((y) => y === x.data.label) &&
          filterChildNodesToSameParentOrExternal(x),
      )
      .map((x) => ({ label: x.data.name, value: x.id }));
  }, [nodes, nodeId, filterChildNodesToSameParentOrExternal]);

  const groupedOptions = [
    {
      key: 'component',
      label: <span>Component Output</span>,
      title: 'Component Output',
      options: componentIdOptions,
    },
    {
      key: 'begin',
      label: <span>Begin Input</span>,
      title: 'Begin Input',
      options: query.map((x) => ({
        label: x.name,
        value: `begin@${x.key}`,
      })),
    },
  ];

  return groupedOptions;
};

export const useGetComponentLabelByValue = (nodeId: string) => {
  const options = useBuildComponentIdSelectOptions(nodeId);
  const flattenOptions = useMemo(
    () =>
      options.reduce<DefaultOptionType[]>((pre, cur) => {
        return [...pre, ...cur.options];
      }, []),
    [options],
  );

  const getLabel = useCallback(
    (val?: string) => {
      return flattenOptions.find((x) => x.value === val)?.label;
    },
    [flattenOptions],
  );
  return getLabel;
};
