import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';

export const RatingComponentJSX = (props: { cellContent: string }): JSX.Element => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');

  return (
    <div>
      <h3>Rate this cell</h3>
      <p>{props.cellContent}</p>
      <select
        value={rating || ''}
        onChange={e => setRating(Number(e.target.value))}
      >
        <option value="" disabled>
          Select rating
        </option>
        {Array.from({ length: 11 }).map((_, i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Leave a comment"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button onClick={() => alert(`Rated ${rating}. Comment: ${comment}`)}>
        Submit
      </button>
    </div>
  );
};

export class RatingWidget extends ReactWidget {
  private cellContent: string;

  constructor(cellContent: string) {
    super();
    this.addClass('jp-react-widget');
    this.id = `rating-widget-${Date.now()}`;
    this.cellContent = cellContent;
  }

  render(): JSX.Element {
    return <RatingComponentJSX cellContent={this.cellContent} />;
  }

  updateContent(newContent: string): void {
    this.cellContent = newContent;
    this.update();
  }
}
