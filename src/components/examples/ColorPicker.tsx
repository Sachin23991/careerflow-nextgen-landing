import { ColorPicker } from '../ColorPicker';
import { useState } from 'react';

export default function ColorPickerExample() {
  const [color, setColor] = useState('#3b82f6');
  
  return (
    <div className="p-6 max-w-md">
      <ColorPicker color={color} onChange={setColor} />
      <div className="mt-4 text-sm text-muted-foreground">
        Selected: {color}
      </div>
    </div>
  );
}
