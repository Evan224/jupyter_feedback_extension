import { useState } from 'react';
import Picker from 'emoji-picker-react';
import { ReactWidget } from '@jupyterlab/ui-components';
import {
  JupyterFrontEnd,
} from '@jupyterlab/application';
import {INotebookTracker} from '@jupyterlab/notebook';

function CommentBox(params:any) {
  const {app,notebookTracker}:{
    app:JupyterFrontEnd,
    notebookTracker:INotebookTracker
  } = params.params;
  if(!app){
    return <div>please wait</div>
  }

  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const position=notebookTracker?.activeCell?.editor?.getSelection() as any;
  const selected_text =window.getSelection()?.toString();
  const user_id = localStorage.getItem("user_id");
  let start = {line:0,column:0};
  let end = {line:0,column:0};

  if(position){
    start=position.start;
    end=position.end;
  }

  const handleEmojiClick = (emojiObject:any) => {
    setComment(prevComment => prevComment + emojiObject.emoji);
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      // Assuming you have an endpoint at /comments to receive the comment
      fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment,
          start_line:start.line,
          end_line:end.line,
          start_column:start.column,
          end_column:end.column,
          user_id:user_id,
          selected_text:selected_text,
          cell_number:notebookTracker?.activeCell?.dataset?.windowedListIndex,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
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

    updateParams(params:any){
      this.params = params;
      this.update();
    }
  
    render() {
      return <CommentBox params={this.params} />;
    }
}

export default CommentBoxWidget;
