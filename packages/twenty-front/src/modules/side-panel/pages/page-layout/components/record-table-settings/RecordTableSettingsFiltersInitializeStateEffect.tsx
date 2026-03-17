import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableSettingsFiltersInitializeStateEffectProps = {
  view: View;
  objectMetadataItem: ObjectMetadataItem;
};

export const RecordTableSettingsFiltersInitializeStateEffect = ({
  view,
  objectMetadataItem,
}: RecordTableSettingsFiltersInitializeStateEffectProps) => {
  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  const [
    shouldSetAdvancedFilterDropdownStates,
    setShouldSetAdvancedFilterDropdownStates,
  ] = useState(false);

  const lastInitializedViewId = useRef<string | null>(null);

  useEffect(() => {
    if (lastInitializedViewId.current === view.id) {
      return;
    }

    lastInitializedViewId.current = view.id;

    const filterableFields = getFilterableFields(objectMetadataItem);
    const recordFilters = mapViewFiltersToFilters(
      view.viewFilters,
      filterableFields,
    );

    setCurrentRecordFilters(recordFilters);

    if (isDefined(view.viewFilterGroups) && view.viewFilterGroups.length > 0) {
      setCurrentRecordFilterGroups(
        mapViewFilterGroupsToRecordFilterGroups(view.viewFilterGroups),
      );
    }

    setShouldSetAdvancedFilterDropdownStates(true);
  }, [
    view,
    objectMetadataItem,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
