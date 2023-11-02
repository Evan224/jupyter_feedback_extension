import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Comment, TextSelection, aggregateComments, generateMockComments } from "./utils";
import { Segment, Header, List, Accordion, Pagination } from 'semantic-ui-react';


function TeacherView({ params }: any) {
  const activeCell= params.notebookTracker.activeCell;
  const originalCodeDoc= activeCell?.editor?.doc?.text;
  const [comments, setComments] = useState<Comment[]>([]);
  const cell_type = params.cell_type || 'code';
  const codeDoc = originalCodeDoc;
  const [aggregatedData, setAggregatedData] = useState<TextSelection[]>([]);
  const [hoveredSelection, setHoveredSelection] = useState<TextSelection | null>(null);
  // const [codeDoc, setCodeDoc] = useState<string[]>([]);
  // const [cell_type, setCellType] = useState<"code" | "markdown">("code");
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [activePage, setActivePage] = useState<number>(1);
  const itemsPerPage = 3;

  const handleClick = (e: any, titleProps: any) => {
    const { index } = titleProps
    const newIndex = activeIndex === index ? -1 : index
    setActiveIndex(newIndex)
    setActivePage(1)  // reset active page to 1 when toggling accordion
  }

  const handlePaginationChange = (e: any, { activePage }: any) => setActivePage(activePage);

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
    <Segment style={{ height: '100%', overflowY: 'auto' }}>
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
      <Header as='h2'>Aggregated Data</Header>
      <List divided relaxed>
        {aggregatedData.map((data, index) => (
          <List.Item
            key={index}
            onMouseEnter={() => handleMouseEnter(data)}
            onMouseLeave={handleMouseLeave}
          >
            <List.Content>
              <List.Header>
                Lines: {data.start_line} to {data.end_line}
              </List.Header>
              <List.Description>
                <p>Selected Count: {data.count}</p>
                <Accordion>
                  <Accordion.Title
                    active={activeIndex === index}
                    index={index}
                    onClick={handleClick}
                  >
                    Show Comments
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === index}>
                    {data.comments.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((comment, idx) => (
                      <p key={idx}>{comment}</p>
                    ))}
                    <div style={{ margin: '10px 0' }}>  {/* Added div with margin here */}
                      <Pagination
                        activePage={activePage}
                        onPageChange={handlePaginationChange}
                        totalPages={Math.ceil(data.comments.length / itemsPerPage)}
                        siblingRange={0}  // Set siblingRange to 0
                        boundaryRange={0}  // Set boundaryRange to 0
                      />
                    </div>
                  </Accordion.Content>
                </Accordion>
              </List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Segment>
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
