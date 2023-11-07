import React, { useState } from 'react';
import { Button, Segment } from 'semantic-ui-react';
import { ReactWidget } from '@jupyterlab/ui-components';

const emotions = {
  1: '😞', // 非常不满意
  2: '😕', // 不满意
  3: '😐', // 中立
  4: '🙂', // 满意
  5: '😀'  // 非常满意
};

function RateBox({ params}:{params:any} ) {
    const [rating, setRating] = useState(null);

    const handleEmotionClick = (newRating:any) => {
        setRating(newRating);
    };

    const handleSubmit = () => {
        console.log('Rating submitted:', rating);
    };

    return (
        <Segment>
            <div>
                {Object.entries(emotions).map(([value, emoji]) => (
                    <Button 
                      key={value}
                      onClick={() => handleEmotionClick(Number(value))}
                      style={{ background: 'none', border: 'none', fontSize: '24px' }}
                    >
                        {emoji}
                    </Button>
                ))}
            </div>
            <Button positive onClick={handleSubmit}>Submit Rating</Button>
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