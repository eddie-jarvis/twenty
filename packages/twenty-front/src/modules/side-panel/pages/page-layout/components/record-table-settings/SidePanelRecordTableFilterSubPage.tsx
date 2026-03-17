import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { RecordTableSettingsFilters } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFilters';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const SidePanelRecordTableFilterSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const { configuration } = widgetInEditMode;

  const isRecordTableConfiguration =
    configuration.configurationType === WidgetConfigurationType.RECORD_TABLE;

  const viewId =
    isRecordTableConfiguration &&
    'viewId' in configuration &&
    isDefined(configuration.viewId)
      ? (configuration.viewId as string)
      : undefined;

  if (
    !isDefined(viewId) ||
    !isDefined(widgetInEditMode.objectMetadataId)
  ) {
    return null;
  }

  return (
    <RecordTableSettingsFilters
      viewId={viewId}
      objectMetadataId={widgetInEditMode.objectMetadataId}
      widgetId={widgetInEditMode.id}
    />
  );
};
