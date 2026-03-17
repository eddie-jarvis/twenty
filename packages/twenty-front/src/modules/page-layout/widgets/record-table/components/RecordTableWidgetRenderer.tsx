import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { isDefined } from 'twenty-shared/utils';

type RecordTableWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordTableWidgetRenderer = ({
  widget,
}: RecordTableWidgetRendererProps) => {
  const hasRequiredConfiguration =
    isDefined(widget.objectMetadataId) &&
    'viewId' in widget.configuration &&
    isDefined(widget.configuration.viewId);

  if (!hasRequiredConfiguration) {
    return null;
  }

  return (
    <RecordTableWidgetRendererContent
      objectMetadataId={widget.objectMetadataId as string}
      viewId={widget.configuration.viewId as string}
      widgetId={widget.id}
    />
  );
};
