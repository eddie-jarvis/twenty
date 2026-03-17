import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { ViewType } from '~/generated-metadata/graphql';

const DEFAULT_VIEW_FIELD_SIZE = 180;

export const useCreateViewForRecordTableWidget = (pageLayoutId: string) => {
  const { performViewAPICreate } = usePerformViewAPIPersist();
  const { performViewFieldAPICreate } = usePerformViewFieldAPIPersist();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const createViewForRecordTableWidget = useCallback(
    async (objectMetadataItem: ObjectMetadataItem) => {
      const newViewId = v4();

      const viewResult = await performViewAPICreate(
        {
          input: {
            id: newViewId,
            name: `${objectMetadataItem.labelPlural} Table`,
            icon: objectMetadataItem.icon ?? 'IconTable',
            objectMetadataId: objectMetadataItem.id,
            type: ViewType.TABLE,
          },
        },
        objectMetadataItem.id,
      );

      if (viewResult.status !== 'successful') {
        return;
      }

      const eligibleFields = objectMetadataItem.fields.filter(
        (field) =>
          field.isActive &&
          !isHiddenSystemField(field) &&
          field.name !== 'deletedAt',
      );

      const sortedFields = eligibleFields.toSorted((fieldA, fieldB) => {
        const isFieldALabelIdentifier =
          fieldA.id === objectMetadataItem.labelIdentifierFieldMetadataId;
        const isFieldBLabelIdentifier =
          fieldB.id === objectMetadataItem.labelIdentifierFieldMetadataId;

        if (isFieldALabelIdentifier) return -1;
        if (isFieldBLabelIdentifier) return 1;

        return 0;
      });

      const viewFieldInputs = sortedFields.map((field, index) => ({
        id: v4(),
        viewId: newViewId,
        fieldMetadataId: field.id,
        position: index,
        size: DEFAULT_VIEW_FIELD_SIZE,
        isVisible: true,
      }));

      await performViewFieldAPICreate({ inputs: viewFieldInputs });

      updateCurrentWidgetConfig({
        configToUpdate: {
          viewId: newViewId,
        },
      });
    },
    [
      performViewAPICreate,
      performViewFieldAPICreate,
      updateCurrentWidgetConfig,
    ],
  );

  return { createViewForRecordTableWidget };
};
