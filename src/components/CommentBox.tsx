import { useState } from 'react';
import Picker from 'emoji-picker-react';
import { ReactWidget } from '@jupyterlab/ui-components';

function CommentBox(codeMirrorEditor:any) {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject:any) => {
    console.log(emojiObject);  // Log the emojiObject
    setComment(prevComment => prevComment + emojiObject.emoji);
  };
  

  const handleSubmit = () => {
    if (comment.trim()) {
      // setComment('');
      console.log(codeMirrorEditor,'test2')
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
    codeMirrorEditor:any;
  
    constructor(codeMirrorEditor:any) {
      super();
      this.codeMirrorEditor = codeMirrorEditor;
    }
  
    render() {
      return <CommentBox codeMirrorEditor={this.codeMirrorEditor} />;
    }
  }
  

export default CommentBoxWidget;
