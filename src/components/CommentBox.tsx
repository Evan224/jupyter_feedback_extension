import { useEffect, useState } from 'react';
import Picker from 'emoji-picker-react';
import { ReactWidget } from '@jupyterlab/ui-components';

function CommentBox({ onSubmit: onSubmit }: { onSubmit: (comment: string) => void }) {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject:any) => {
    console.log(emojiObject);  // Log the emojiObject
    setComment(prevComment => prevComment + emojiObject.emoji);
  };
  

  useEffect(() => {
    console.log('comment changed', comment)
  }, [comment]);

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

class CommentBoxWidget extends ReactWidget {
    onSubmit: (comment: string) => void;
  
    constructor(onSubmit: (comment: string) => void) {
      super();
      this.onSubmit = onSubmit;
    }
  
    render() {
      return <CommentBox onSubmit={this.onSubmit} />;
    }
  }
  

export default CommentBoxWidget;
