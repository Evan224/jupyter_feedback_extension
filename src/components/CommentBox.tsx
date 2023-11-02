import { useState } from 'react';
import Picker from 'emoji-picker-react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Button, TextArea, Segment, Modal } from 'semantic-ui-react';

function CommentBox(params: any) {
    const { app, notebookTracker }: { app: JupyterFrontEnd; notebookTracker: INotebookTracker } = params.params;
    if (!app) {
        return <Segment placeholder loading />;
    }

    const [comment, setComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const position = notebookTracker?.activeCell?.editor?.getSelection() as any;
    const selected_text = window.getSelection()?.toString();
    const user_id = localStorage.getItem("user_id");
    let start = { line: 0, column: 0 };
    let end = { line: 0, column: 0 };

    if (position) {
        start = position.start;
        end = position.end;
    }

    const handleEmojiClick = (emojiObject: any) => {
        setComment(prevComment => prevComment + emojiObject.emoji);
    };

    const handleSubmit = () => {
        if (comment.trim()) {
            fetch('http://localhost:3000/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment: comment,
                    start_line: start.line,
                    end_line: end.line,
                    start_column: start.column,
                    end_column: end.column,
                    user_id: user_id,
                    selected_text: selected_text,
                    cell_number: notebookTracker?.activeCell?.dataset?.windowedListIndex,
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setComment('');  // Clear the comment box after successful submission
                })
                .catch(error => {
                    console.error('Error submitting comment:', error);
                });
        }
    };

    return (
        <Segment>
            <TextArea
                value={comment}
                onChange={(e, { value }) => setComment(value as string)}
                placeholder="Write a comment..."
            />
            <Button.Group>
                <Modal
                    onClose={() => setShowEmojiPicker(false)}
                    open={showEmojiPicker}
                    trigger={<Button icon="smile outline" onClick={() => setShowEmojiPicker(true)} />}
                >
                    <Modal.Content>
                        <Picker onEmojiClick={handleEmojiClick} />
                    </Modal.Content>
                </Modal>
                <Button positive onClick={handleSubmit}>Submit</Button>
            </Button.Group>
        </Segment>
    );
}

class CommentBoxWidget extends ReactWidget {
    params: any;

    constructor(params: any) {
        super();
        this.params = params;
    }

    updateParams(params: any) {
        this.params = params;
        this.update();
    }

    render() {
        return <CommentBox params={this.params} />;
    }
}

export default CommentBoxWidget;
