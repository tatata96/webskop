import './folder_color_picker.scss'

export type FolderColorPickerProps = {
  value: string
  onChange: (hex: string) => void
}

export function FolderColorPicker(props: FolderColorPickerProps) {
  return (
    <div className="folder-color-picker">
      <input
        type="color"
        className="folder-color-picker__input"
        value={props.value}
        aria-label="Folder color"
        title="Folder color"
        onChange={(e) => {
          props.onChange(e.target.value)
        }}
      />
    </div>
  )
}
