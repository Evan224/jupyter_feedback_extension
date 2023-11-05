// File: RateBox.tsx

import React, { useState } from 'react';
import { Button, Segment } from 'semantic-ui-react';
import { ReactWidget } from '@jupyterlab/ui-components';

function RateBox({ params }: any) {
    const [rating, setRating] = useState(5);  // Assuming rating scale of 1 to 10

    const handleSubmit = () => {
        // Handle submission of rating
        console.log('Rating submitted:', rating);
    };

    return (
        <Segment>
            <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
            />
            <span>{rating}</span>
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