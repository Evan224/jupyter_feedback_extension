import { useState } from 'react';
import Picker from 'emoji-picker-react';
import { ReactWidget } from '@jupyterlab/ui-components';

function CommentBox(params:any) {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject:any) => {
    console.log(emojiObject);  // Log the emojiObject
    setComment(prevComment => prevComment + emojiObject.emoji);
  };

  const handleSubmit = () => {
    console.log('Submitting comment:', params)
    if (comment.trim()) {
      // Assuming you have an endpoint at /comments to receive the comment
      fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment,
          start_line:params.params.start.line,
          end_line:params.params.end.line,
          start_column:params.params.start.column,
          end_column:params.params.end.column,
          user_id:params.params.uuid,
          selected_text:params.params.selected_text,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Comment submitted:', data);
        setComment(''); // Clear the comment box after successful submission
      })
      .catch(error => {
        console.error('Error submitting comment:', error);
      });
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
    params:any;
  
    constructor(params:any) {
      super();
      this.params = params;
    }
  
    render() {
      return <CommentBox params={this.params} />;
    }
}

export default CommentBoxWidget;
