import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Comment, TextSelection, aggregateComments, generateMockComments } from "./utils";

interface TeacherViewProps {
  cell_type?: "code" | "markdown";
  codeDoc: string[];
}

function TeacherView({ params }: any) {
  const [comments, setComments] = useState<Comment[]>([]);
  const cell_type = params.cell_type || 'code';
  const codeDoc = params.editor?.doc?.text;
  const [aggregatedData, setAggregatedData] = useState<TextSelection[]>([]);
  const [hoveredSelection, setHoveredSelection] = useState<TextSelection | null>(null);
  // const [codeDoc, setCodeDoc] = useState<string[]>([]);
  // const [cell_type, setCellType] = useState<"code" | "markdown">("code");

  const handleMouseEnter = (selection: TextSelection) => {
    setHoveredSelection(selection);
  };

  const handleMouseLeave = () => {
    setHoveredSelection(null);
  };

  const codeString = codeDoc?.join('\n');

  useEffect(() => {
    const mockData = generateMockComments();
    setComments(mockData.comments);
    // setCodeDoc(mockData.codeDoc);
    const aggregationResult = aggregateComments(mockData.comments, cell_type);
    setAggregatedData(aggregationResult);
  }, [cell_type, codeDoc]);

  return (
    <div>
      <SyntaxHighlighter
        language="javascript"
        style={docco}
        showLineNumbers
        wrapLines
        lineProps={(lineNumber:any) => {
          let style = {};
          if (
            hoveredSelection &&
            lineNumber >= hoveredSelection.start_line &&
            lineNumber <= hoveredSelection.end_line
          ) {
            style = { backgroundColor: "rgba(255,255,0,0.5)" };
          }
          return { style };
        }}
      >
        {codeString}
      </SyntaxHighlighter>
      <h2>Aggregated Data</h2>
      {aggregatedData.map((data, index) => (
        <div
          key={index}
          onMouseEnter={() => handleMouseEnter(data)}
          onMouseLeave={handleMouseLeave}
        >
          <p>
            Lines: {data.start_line} to {data.end_line}
          </p>
          <p>Selected Count: {data.count}</p>
          <p>Comments: {data.comments.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}  

class TeacherViewWidget extends ReactWidget {
  params: any;

  constructor(params: any) {
    super();
    this.params = params;
  }

  updateProps(newParams: any) {
    this.params = newParams;
    this.update();  // 告诉Lumino重新渲染此widget
  }


  render() {
    return <TeacherView params={this.params} />;
  }
}

export default TeacherViewWidget;
