import { useState,useEffect } from 'react';
import Picker from 'emoji-picker-react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Button, TextArea, Segment, Modal, Message } from 'semantic-ui-react';

function CommentBox(params: any) {
    console.log(params?.params?.selected_text,'----------------')
    const { app, notebookTracker }: { app: JupyterFrontEnd; notebookTracker: INotebookTracker } = params.params;
    if (!app) {
        return <Segment placeholder loading />;
    }
    const [submitSuccess, setSubmitSuccess] = useState(false); // 新增状态，用于追踪提交状态
    const [comment, setComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker]= useState(false);
    const position = notebookTracker?.activeCell?.editor?.getSelection() as any;
    const user_id = localStorage.getItem("user_id");
    let start = { line: 0, column: 0 };
    let end = { line: 0, column: 0 };

    if (position) {
        start = position.start;
        end = position.end;
    }

    const handleEmojiClick = (emojiObject: any) => {
        setComment(prevComment => prevComment + emojiObject.emoji);
        setShowEmojiPicker(false); 
    };
    

    const handleSubmit = () => {
        if (comment.trim()) {
            console.log(comment, start, end, user_id, params?.params?.selected_text, notebookTracker?.activeCell?.dataset?.windowedListIndex)
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
                    selected_text: params?.params?.selected_text,
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
                    setComment('');
                    setSubmitSuccess(true); // 设置为 true 显示成功消息
                    setTimeout(() => setSubmitSuccess(false), 3000); // 3秒后自动隐藏消息
                })
                .catch(error => {
                    console.error('Error submitting comment:', error);
                })
                .finally(() => {
                    setSubmitSuccess(true);
                    setTimeout(() => setSubmitSuccess(false), 3000);
                });
        }
    };

    return (
        <Segment style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 20px)' }}>
            {params?.params?.selected_text && (
                <Message>
                    <Message.Header>Selected Text</Message.Header>
                    <p>{params?.params?.selected_text}</p>
                </Message>
            )}
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
            {submitSuccess && (
                <Message positive>
                    <Message.Header>Success</Message.Header>
                    <p>Your comment has been submitted.</p>
                </Message>
            )}
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
