import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { useEffect, useState } from 'react';
import { type ViewSortDirection } from '~/generated-metadata/graphql';

type RecordTableSettingsSortsInitializeStateEffectProps = {
  view: View;
};

export const RecordTableSettingsSortsInitializeStateEffect = ({
  view,
}: RecordTableSettingsSortsInitializeStateEffectProps) => {
  const setCurrentRecordSorts = useSetAtomComponentState(
    currentRecordSortsComponentState,
  );

  const [hasInitializedSorts, setHasInitializedSorts] = useState(false);

  useEffect(() => {
    if (hasInitializedSorts) {
      return;
    }

    const recordSorts: RecordSort[] = (view.viewSorts ?? []).map(
      (viewSort) => ({
        id: viewSort.id,
        fieldMetadataId: viewSort.fieldMetadataId,
        direction: viewSort.direction as ViewSortDirection,
      }),
    );

    setCurrentRecordSorts(recordSorts);
    setHasInitializedSorts(true);
  }, [view, hasInitializedSorts, setCurrentRecordSorts]);

  return null;
};
