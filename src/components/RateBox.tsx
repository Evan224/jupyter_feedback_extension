import React, { useState } from 'react';
import { Button, Segment, Label, Message } from 'semantic-ui-react';
import { ReactWidget } from '@jupyterlab/ui-components';

const emotions = {
  1: '😞', // 非常不满意
  2: '😕', // 不满意
  3: '😐', // 中立
  4: '🙂', // 满意
  5: '😀'  // 非常满意
};

function RateBox({ params }: { params: any }) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleEmotionClick = (newRating: number) => {
    setRating(newRating);
    setSubmitted(false); // 重置提交状态
  };

  const handleSubmit = () => {
    console.log('Rating submitted:', rating);
    setSubmitted(true); // 更新提交状态
  };

  return (
    <Segment>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {Object.entries(emotions).map(([value, emoji]) => (
          <div key={value} style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
            <Button
              aria-label={`Rate ${value}`}
              onClick={() => handleEmotionClick(Number(value))}
              style={{
                background: rating === Number(value) ? 'lightblue' : 'none',
                border: 'none',
                fontSize: '24px'
              }}
            >
              {emoji}
            </Button>
            <Label style={{ marginLeft: '10px' }} circular color={rating === Number(value) ? 'blue' : 'grey'}>
              {value}
            </Label>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Button positive onClick={handleSubmit}>Submit Rating</Button>
        {submitted && (
          <Message success style={{ marginTop: '10px' }}>
            <Message.Header>Thank You!</Message.Header>
            <p>Your feedback has been submitted.</p>
          </Message>
        )}
      </div>
    </Segment>
  );
}

class RateBoxWidget extends ReactWidget {
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
    return <RateBox params={this.params} />;
  }
}

export default RateBoxWidget;
