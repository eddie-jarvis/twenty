import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type StandaloneRecordTableViewLoadEffectProps = {
  viewId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const StandaloneRecordTableViewLoadEffect = ({
  viewId,
  objectMetadataItem,
}: StandaloneRecordTableViewLoadEffectProps) => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const [lastLoadedViewId, setLastLoadedViewId] = useState<string | undefined>(
    undefined,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId,
  });

  useEffect(() => {
    if (lastLoadedViewId === viewId) {
      return;
    }

    if (!isDefined(view)) {
      return;
    }

    loadRecordIndexStates(view, objectMetadataItem);
    setLastLoadedViewId(viewId);
  }, [viewId, lastLoadedViewId, view, objectMetadataItem, loadRecordIndexStates]);

  return null;
};
