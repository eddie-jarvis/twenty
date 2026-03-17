import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type RecordTableWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordTableWidgetRenderer = ({
  widget,
}: RecordTableWidgetRendererProps) => {
  return <div>Record Table Widget — {widget.title}</div>;
};
