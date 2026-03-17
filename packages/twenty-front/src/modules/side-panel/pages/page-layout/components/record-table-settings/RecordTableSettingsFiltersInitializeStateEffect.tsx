import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect, useState } from 'react';
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

  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  const [
    shouldSetAdvancedFilterDropdownStates,
    setShouldSetAdvancedFilterDropdownStates,
  ] = useState(false);

  useEffect(() => {
    if (hasInitializedFilters) {
      return;
    }

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
    setHasInitializedFilters(true);
  }, [
    view,
    objectMetadataItem,
    hasInitializedFilters,
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
