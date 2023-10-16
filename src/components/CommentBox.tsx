import { useState } from 'react';
import Picker from 'emoji-picker-react';

function CommentBox({ onSubmit: onSubmit }: { onSubmit: (comment: string) => void }) {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (event:any, emojiObject:any) => {
    setComment(prevComment => prevComment + emojiObject.emoji);
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };

  return (
    <div>
      <textarea 
        value={comment} 
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
      />
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        😃
      </button>
      {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
      <button onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

export default CommentBox;
