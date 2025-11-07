import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <Label>Accent Color</Label>
      
      <div className="grid grid-cols-4 gap-2">
        {presetColors.map((preset) => (
          <button
            key={preset.value}
            className={`h-12 rounded-md border-2 transition-all hover-elevate ${
              color === preset.value ? 'border-foreground ring-2 ring-offset-2 ring-foreground/20' : 'border-transparent'
            }`}
            style={{ backgroundColor: preset.value }}
            onClick={() => onChange(preset.value)}
            title={preset.name}
            data-testid={`button-color-${preset.name.toLowerCase()}`}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded-md border cursor-pointer"
          data-testid="input-color-custom"
        />
        <span className="text-sm text-muted-foreground">Custom color</span>
      </div>
    </div>
  );
}
