import { DesktopBanner } from './components/desktop-banner/DesktopBanner'
import { DesktopSidebar } from './components/desktop-sidebar/DesktopSidebar'
import { Desktop } from './components/desktop/Desktop'
import { FolderColorPicker } from './components/folder-color-picker/FolderColorPicker'
import { ResourcesExport } from './components/resources-export/ResourcesExport'
import { folderAccentColor } from './core/ui/folderAccentColor'
import { useMainPageState } from './hooks/useMainPageState'
import './App.scss'

export function MainPage() {
  const {
    items,
    openFolderId,
    folderSidebarOpen,
    resourcesPageOpen,
    folderIconColor,
    searchQuery,
    openFolder,
    visibleFolders,
    visibleLinks,
    globalLinkResults,
    showFolderColorPicker,
    searchPlaceholder,
    searchDropdownOpen,
    setSearchQuery,
    handleToggleFolderList,
    handleCloseFolderList,
    handleCloseResources,
    handleFolderSelect,
    handleFolderLinksChange,
    handleAddItem,
    handleFolderOpen,
    handleGoHome,
    handleToggleResources,
    handleFoldersItemsChange,
    handleSearchResultSelect,
    handleFolderIconColorChange,
  } = useMainPageState()

  return (
    <div className="app-shell">
      <DesktopBanner
        onGoHome={handleGoHome}
        showAdd={openFolderId === null}
        onAddItem={handleAddItem}
        resourcesOpen={resourcesPageOpen}
        onToggleResources={handleToggleResources}
        folderListOpen={folderSidebarOpen}
        onToggleFolderList={handleToggleFolderList}
        searchQuery={searchQuery}
        searchPlaceholder={searchPlaceholder}
        onSearchQueryChange={setSearchQuery}
        searchDropdownOpen={searchDropdownOpen}
        searchResults={globalLinkResults}
        onSelectSearchResult={handleSearchResultSelect}
        currentFolderLabel={openFolder?.label ?? null}
        folderTriangleColor={folderIconColor}
      />

      <div className="app-shell__body">
        <div className="app-shell__main">
          {resourcesPageOpen ? (
            <ResourcesExport
              folders={items}
              onClose={handleCloseResources}
            />
          ) : openFolder ? (
            <Desktop
              surface="links"
              items={visibleLinks}
              onItemsChange={handleFolderLinksChange}
              folderAccentColor={folderAccentColor(openFolder.id)}
            />
          ) : (
            <Desktop
              surface="folders"
              items={visibleFolders}
              onItemsChange={handleFoldersItemsChange}
              onFolderOpen={handleFolderOpen}
              folderIconColor={folderIconColor}
            />
          )}
        </div>

        <DesktopSidebar
          open={folderSidebarOpen}
          folders={items}
          activeFolderId={openFolderId}
          onClose={handleCloseFolderList}
          onFolderSelect={handleFolderSelect}
        />
      </div>

      {showFolderColorPicker && (
        <FolderColorPicker
          value={folderIconColor}
          onChange={handleFolderIconColorChange}
        />
      )}
    </div>
  )
}
