import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { RecordTableDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableDataSourceDropdownContent';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDatabase, IconEye, IconFilter } from 'twenty-ui/display';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const SidePanelPageLayoutRecordTableSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const { configuration } = widgetInEditMode;

  const isRecordTableConfiguration =
    configuration.configurationType === WidgetConfigurationType.RECORD_TABLE;

  const hasViewId =
    isRecordTableConfiguration &&
    'viewId' in configuration &&
    isDefined(configuration.viewId);

  const selectableItemIds = [
    'record-table-source',
    ...(hasViewId ? ['record-table-fields', 'record-table-filter'] : []),
  ];

  const handleFieldsClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableFields);
  };

  const handleFilterClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableFilter);
  };

  return (
    <StyledContainer>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: widgetInEditMode.id }}
      >
        <StyledSettingsContainer>
          <SidePanelList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
          >
            <SidePanelGroup heading={t`Data`}>
              <SelectableListItem itemId="record-table-source">
                <CommandMenuItemDropdown
                  Icon={IconDatabase}
                  label={t`Source`}
                  id="record-table-source"
                  dropdownId="record-table-source"
                  dropdownComponents={
                    <DropdownContent>
                      <RecordTableDataSourceDropdownContent />
                    </DropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              {hasViewId && (
                <>
                  <SelectableListItem
                    itemId="record-table-fields"
                    onEnter={handleFieldsClick}
                  >
                    <CommandMenuItem
                      id="record-table-fields"
                      label={t`Fields`}
                      Icon={IconEye}
                      hasSubMenu
                      onClick={handleFieldsClick}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-filter"
                    onEnter={handleFilterClick}
                  >
                    <CommandMenuItem
                      id="record-table-filter"
                      label={t`Filter`}
                      Icon={IconFilter}
                      hasSubMenu
                      onClick={handleFilterClick}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                </>
              )}
            </SidePanelGroup>
          </SidePanelList>
        </StyledSettingsContainer>
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </WidgetComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
