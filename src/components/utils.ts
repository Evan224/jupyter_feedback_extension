import { jsPDF } from "jspdf";
//@ts-ignore
import Papa from "papaparse";
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
  filter: string, // 添加filter参数
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

  return textSelections
    .sort((a, b) => b.count - a.count)
    .filter((data) => {
      switch (filter) {
        case "1-5":
          return data.count >= 1 && data.count <= 5;
        case "6-10":
          return data.count >= 6 && data.count <= 10;
        case "10+":
          return data.count > 10;
        default:
          return true;
      }
    });
}

function exportCommentsToCSV(comments: Comment[]) {
  const csv = Papa.unparse(comments);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "comments.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportCommentsToPDF(comments: Comment[]) {
  const doc = new jsPDF();
  let cursorY = 10;
  comments.forEach((comment, idx) => {
    doc.text(`Comment ${idx + 1}: ${comment.comment}`, 20, cursorY);
    cursorY += 10;
  });
  doc.save("comments.pdf");
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

function getColorForLineCount(count: any) {
  if (count > 10) {
    return "rgba(255, 0, 0, 0.5)"; // 红色，评论很多
  } else if (count > 5) {
    return "rgba(255, 165, 0, 0.5)"; // 橙色，评论较多
  } else if (count > 0) {
    return "rgba(255, 255, 0, 0.5)"; // 黄色，有一些评论
  }
  return ""; // 无评论，无背景色
}

function generateSummary(comments: any) {
  if (comments.length === 0) {
    return "No comments";
  }
  // 取第一个评论的前30个字符作为摘要
  return comments[0].substr(0, 30) + (comments[0].length > 30 ? "..." : "");
}

export {
  aggregateComments,
  Comment,
  exportCommentsToCSV,
  exportCommentsToPDF,
  generateMockComments,
  generateSummary,
  getColorForLineCount,
  TextSelection,
};
