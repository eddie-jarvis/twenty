import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const StandaloneRecordTableSetReadOnlyColumnHeadersEffect = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const store = useStore();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  useEffect(() => {
    store.set(
      isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      !isPageLayoutInEditMode,
    );
  }, [store, recordTableId, isPageLayoutInEditMode]);

  return null;
};
