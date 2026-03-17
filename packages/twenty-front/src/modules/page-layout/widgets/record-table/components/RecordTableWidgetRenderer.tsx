import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';

type RecordTableWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordTableWidgetRenderer = ({
  widget,
}: RecordTableWidgetRendererProps) => {
  const { configuration } = widget;

  const isRecordTableConfiguration = isWidgetConfigurationOfType(
    configuration,
    'RecordTableConfiguration',
  );

  if (
    !isRecordTableConfiguration ||
    !isDefined(widget.objectMetadataId) ||
    !isDefined(configuration.viewId)
  ) {
    return null;
  }

  return (
    <RecordTableWidgetRendererContent
      objectMetadataId={widget.objectMetadataId}
      viewId={configuration.viewId}
      widgetId={widget.id}
    />
  );
};
