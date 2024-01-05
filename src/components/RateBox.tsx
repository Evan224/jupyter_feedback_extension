import React, { useState,useEffect } from 'react';
import { Button, Segment, Label, Message, Header, Icon } from 'semantic-ui-react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { JupyterFrontEnd } from '@jupyterlab/application';
import {LabIcon,reactIcon} from "@jupyterlab/ui-components";
import { INotebookTracker } from '@jupyterlab/notebook';

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
  const { app, notebookTracker }: { app: JupyterFrontEnd; notebookTracker: INotebookTracker } = params;

  const handleEmotionClick = (newRating: number) => {
    setRating(newRating);
    setSubmitted(false); 
  };

  const handleSubmit = () => {
    if (rating === null) {
        return;
    }
    const user_id = localStorage.getItem("user_id");
    // const { user_id, cell_number } = params;

    fetch('http://localhost:3000/rates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            cell_number: notebookTracker?.activeCell?.dataset?.windowedListIndex,
            rating: rating
        })
    }).then((response) => {
        if (response.ok) {
            setSubmitted(true);
        } else {
            throw new Error('Network response was not ok');
        }
    }).catch((error) => {
        console.error('Error submitting rating:', error);
    });
};


  useEffect(() => {
    setRating(null);
    setSubmitted(false);
  }, [params]);
  
  return (
    <Segment padded>
      <Header as='h2' textAlign='center'>
        Rate This Cell
        <Header.Subheader>
          Evaluate the quality of the current Jupyter Notebook cell.
        </Header.Subheader>
      </Header>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries(emotions).map(([value, emoji]) => (
          <Button
            key={value}
            aria-label={`Rate ${value}`}
            onClick={() => handleEmotionClick(Number(value))}
            color={rating === Number(value) ? 'blue' : undefined}
            icon
            labelPosition='right'
          >
            <Icon name='smile outline' />
            {emoji}
            <Label circular color={rating === Number(value) ? 'blue' : 'grey'}>
              {value}
            </Label>
          </Button>
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
    console.log('updateParams', params);
    this.params = params;
    this.update();
  }

  render() {
    return <RateBox params={this.params} />;
  }
}

export default RateBoxWidget;

export function showRateBox(app: JupyterFrontEnd) {
  const widget = new RateBoxWidget({});
  widget.id = 'ratebox-widget-right';
  widget.title.label = 'Rate Box';
  widget.title.closable = true;
  widget.title.icon = reactIcon;
  // 将 widget 添加到 JupyterLab 主面板
  // if (!app.shell.has(widget.id)) {
  //   app.shell.add(widget, 'main');
  // }
  const existingWidget = Array.from(app.shell.widgets("right")).find((widget) =>
  (widget as any)?.id === 'ratebox-widget-right'
  ) as any;
  if (existingWidget) {
    app.shell.activateById(existingWidget.id);
    return;
  }else{
    app.shell.add(widget, 'right');
  }
  app.shell.activateById(widget.id);
}
