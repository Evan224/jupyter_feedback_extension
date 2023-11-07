import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Comment, TextSelection, aggregateComments, generateMockComments,getColorForLineCount,generateSummary} from "./utils";
import { Segment, Header, List, Accordion, Pagination } from 'semantic-ui-react';
import { Input, Dropdown } from 'semantic-ui-react';
import { exportCommentsToCSV,exportCommentsToPDF } from './utils';
import { Button } from 'semantic-ui-react';

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
  const [clickedSelection, setClickedSelection] = useState<TextSelection | null>(null);
  const itemsPerPage = 3;
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const handleSearchChange = (e:any) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e:any) => {
    setFilter(e.target.value);
  };

  const filterOptions = [
    { key: 'all', text: 'All', value: 'all' },
    { key: '1-5', text: '1-5 Comments', value: '1-5' },
    { key: '6-10', text: '6-10 Comments', value: '6-10' },
    { key: '10+', text: 'More than 10 Comments', value: '10+' },
  ];


  const filteredComments = comments.filter(comment => 
    comment.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  ); 

  const filteredAggregatedData = aggregatedData.filter(data => {
    switch (filter) {
      case '1-5':
        return data.count >= 1 && data.count <= 5;
      case '6-10':
        return data.count >= 6 && data.count <= 10;
      case '10+':
        return data.count > 10;
      default:
        return true;
    }
  });

  const handleClick = (e: any, titleProps: any, selection: TextSelection) => {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
    setActivePage(1);  // reset active page to 1 when toggling accordion

    // 设置被点击的评论对应的文本选择区域
    setClickedSelection(selection);
  };

  // const lineProps = (lineNumber: any) => {
  //   let style = {};
  //   if (
  //     (hoveredSelection &&
  //      lineNumber >= hoveredSelection.start_line &&
  //      lineNumber <= hoveredSelection.end_line) ||
  //     (clickedSelection &&
  //      lineNumber >= clickedSelection.start_line &&
  //      lineNumber <= clickedSelection.end_line)
  //   ) {
  //     style = { backgroundColor: "rgba(255,255,0,0.5)" };
  //   }
  //   return { style };
  // };

  const lineProps = (lineNumber: any) => {
    let style = {};
    
    if (hoveredSelection && lineNumber >= hoveredSelection.start_line && lineNumber <= hoveredSelection.end_line) {
      style = { backgroundColor: "rgba(0, 0, 255, 0.5)" }; // 高亮显示悬停的行
    }
    
    return { style };
  };
  
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
    const aggregationResult = aggregateComments(mockData.comments, cell_type, filter); // 更新调用
    setAggregatedData(aggregationResult);
  }, [cell_type, codeDoc, searchQuery, filter]); 

  return (
    <Segment style={{ height: '100%', overflowY: 'auto' }}>
           <div style={{ margin: '10px 0' }}>
        <Input 
          type="text" 
          placeholder="Search comments..." 
          onChange={handleSearchChange} 
          style={{ marginRight: '10px' }}
        />
        {/* <Dropdown 
          placeholder='Filter' 
          selection 
          options={filterOptions} 
          onChange={handleFilterChange}
        /> */}
      </div>
      <SyntaxHighlighter
        language="javascript"
        style={docco}
        showLineNumbers
        wrapLines
        lineProps={lineProps}
      >
        {codeString}
      </SyntaxHighlighter>
      <Header as='h2'>Comments</Header>
      <Button onClick={() => exportCommentsToCSV(filteredComments)}>Export to CSV</Button>
      <Button onClick={() => exportCommentsToPDF(filteredComments)}>Export to PDF</Button>
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
                {/* <p>Selected Count: {data.count}</p> */}
                <Accordion>
                  <Accordion.Title
                    active={activeIndex === index}
                    index={index}
                    onClick={(e, titleProps) => handleClick(e, titleProps, data)}
                  >
                    Show Comments ({data.comments.length}) - {generateSummary(data.comments)}
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === index}>
                  {data.comments.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((comment, idx) => (
                    <div key={idx} style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>{comment}</div>
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
