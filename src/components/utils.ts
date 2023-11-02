// utils.ts
interface Comment {
  user_id: string;
  cell_number: number;
  start_line: number;
  end_line: number;
  start_column: number;
  end_column: number;
  selected_text: string;
  comment: string;
}

interface TextSelection {
  start_line: number;
  end_line: number;
  count: number;
  comments: string[];
}

function aggregateComments(
  comments: Comment[],
  cell_type: "code" | "markdown",
): TextSelection[] {
  const textSelections: TextSelection[] = [];

  comments.forEach((comment) => {
    const overlappingSelection = textSelections.find((selection) =>
      cell_type === "code"
        ? !(
          comment.end_line < selection.start_line ||
          comment.start_line > selection.end_line
        )
        : !(
          comment.end_line < selection.start_line ||
          comment.start_line > selection.end_line
          //   comment.end_column < selection.start_column ||
          //   comment.start_column > selection.end_column
        )
    );

    if (overlappingSelection) {
      overlappingSelection.count += 1;
      overlappingSelection.comments.push(comment.comment);
    } else {
      textSelections.push({
        start_line: comment.start_line,
        end_line: comment.end_line,
        count: 1,
        comments: [comment.comment],
      });
    }
  });

  return textSelections.sort((a, b) => b.count - a.count);
}

function generateMockComments(): { comments: Comment[]; codeDoc: string[] } {
  const comments: Comment[] = [];
  const codeDoc: string[] = [];

  // Generating 5 lines of code
  for (let i = 1; i <= 5; i++) {
    codeDoc.push(`Line ${i} code here`);
  }

  // Generating 20 random comments
  for (let i = 1; i <= 100; i++) {
    const randomStartLine = Math.floor(Math.random() * 5) + 1; // Random start line between 1 and 5
    const randomEndLine = randomStartLine +
      Math.floor(Math.random() * (6 - randomStartLine)); // Random end line between start line and 5
    comments.push({
      user_id: "user-" + i,
      cell_number: 1,
      start_line: randomStartLine,
      end_line: randomEndLine,
      start_column: 0,
      end_column: 10,
      selected_text:
        `Selected text from line ${randomStartLine} to ${randomEndLine}`,
      comment: "This is comment " + i,
    });
  }

  return { comments, codeDoc };
}

export { aggregateComments, Comment, generateMockComments, TextSelection };
