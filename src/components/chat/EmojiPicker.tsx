import { EMOJI_PICKER } from "../../utils/emoji";

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onPick, onClose }: EmojiPickerProps) {
  return (
    <div className="emoji-picker" role="dialog" aria-label="Pick an emoji">
      <div className="emoji-picker-head">
        <span>Emoji</span>
        <button type="button" className="icon-button" aria-label="Close emoji picker" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="emoji-grid">
        {EMOJI_PICKER.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="emoji-cell"
            aria-label={`Insert ${emoji}`}
            onClick={() => onPick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
