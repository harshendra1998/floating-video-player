# Floating Video Player

A draggable and resizable floating video player (Picture-in-Picture) component for React.

## Installation

```bash
npm install floating-player@1.0.1
```

## Peer Dependencies

```bash
npm install react react-dom
```

## Usage

```tsx
import React, { useState } from 'react';
import { FloatingVideoPlayer } from 'floating-player';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Video</button>
      
      <FloatingVideoPlayer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        content="https://example.com/video.mp4"
        initialWidth={400}
        aspectRatio={16 / 9}
        showControls={true}
        handleColor="#212121"
        backgroundColor="#ffffff"
      />
    </div>
  );
}

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls whether the player is visible |
| `onClose` | `() => void` | - | Callback when close button is clicked |
| `content` | `string \| null \| undefined` | - | Video URL source |
| `initialWidth` | `number` | `window.innerWidth / 3` | Initial width in pixels |
| `initialHeight` | `number` | Calculated from aspect ratio | Initial height in pixels |
| `initialPosition` | `{ x: number, y: number }` | Bottom-right | Initial position |
| `aspectRatio` | `number` | `16/9` | Video aspect ratio |
| `showControls` | `boolean` | `true` | Show drag handle and close button |
| `className` | `string` | `''` | Additional CSS class |
| `style` | `React.CSSProperties` | - | Additional inline styles |
| `handleColor` | `string` | `'#212121'` | Background color of drag handle |
| `backgroundColor` | `string` | `'#ffffff'` | Background color of container |

## Features

- Draggable via mouse and touch
- Resizable from bottom-right corner
- Maintains aspect ratio while resizing
- Mobile responsive
- Automatic boundary constraints
- Autoplay on open
- No external UI library dependencies

## License

MIT
