import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Comment, TextSelection, aggregateComments, generateMockComments,getColorForLineCount,generateSummary,countCommentsPerCell,generateWordFrequency} from "./utils";
import { Segment, Header, List, Accordion, Pagination } from 'semantic-ui-react';
import { Input, Dropdown } from 'semantic-ui-react';
import { exportCommentsToCSV,exportCommentsToPDF } from './utils';
import { Button } from 'semantic-ui-react';
import { Bar } from 'react-chartjs-2';
import { Tab } from 'semantic-ui-react';
import ReactWordcloud from 'react-wordcloud';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { NotebookTracker } from '@jupyterlab/notebook';
//@ts-ignore
import mockData from './mockData.json';
import { set } from 'mongoose';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


interface CommentData {
  start_line: number;
  end_line: number;
  count: number;
}

function TeacherView({ params }: any) {
  const activeCell= params?.notebookTracker?.activeCell;
  const cellsArray = params.notebookTracker?.currentWidget?.content?.cellsArray;
  const content = params?.notebookTracker?.currentWidget?.content;
  if(!activeCell?.model){
    return <></>
  }

  const originalCodeDoc= activeCell?.editor?.doc?.text;
  const [comments, setComments] = useState<Comment[]>([]);
  const cell_type = params.cell_type || 'code';
  const codeDoc = originalCodeDoc;
  const [aggregatedData, setAggregatedData] = useState<TextSelection[]>([]);
  const [hoveredSelection, setHoveredSelection] = useState<TextSelection | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [activePage, setActivePage] = useState<number>(1);
  const [clickedSelection, setClickedSelection] = useState<TextSelection | null>(null);
  const itemsPerPage = 3;
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [globalWordChoice, setGlobalWordChoice] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0); // 假设第一个标签页默认激活
  const activeCellIndex = params?.notebookTracker?.currentWidget?.content.activeCellIndex;
  useEffect(() => {
    const aggregationResult = aggregateComments(comments, cell_type, filter,searchQuery,activeCellIndex); // 更新调用
    setAggregatedData(aggregationResult);
  }, [comments,searchQuery,filter,cell_type,activeCellIndex]);


  const scrollToCell = (cellIndex: number) => {
    const cell = cellsArray[cellIndex];
    if (cell && cell.node) {
      cell.node.scrollIntoView({ behavior: 'smooth',block:'center' });
      content.activeCellIndex = cellIndex;
      setActiveTabIndex(0);
    }
    
  };
  const CommentsBarChart = ({ data }: { data: CommentData[] }) => {
    const chartData = {
      labels: data.map(item => {
        if (item.start_line === item.end_line) {
          return `Line ${item.start_line}`; 
        } else {
          return `Line ${item.start_line} to ${item.end_line}`; 
        }
      }),
      datasets: [
        {
          label: 'Number of Comments',
          data: data.map(item => item.count),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };
    const options = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            // 确保Y轴只显示整数
            stepSize: 1,
            callback: function(value:any, index:any, values:any) {
              if (Math.floor(value) === value) {
                return value;
              }
            },
          },
        },
      },
    };
  
    return <Bar data={chartData} options={options} />;
  };
  const handleSearchChange = (e:any) => {
    setSearchQuery(e.target.value);
  };


  const filteredComments = comments.filter(comment => 
    comment.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  ); 


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

  // const mockCellComments = generateMockCellComments(cellsArray.length);
  const globalCellData=countCommentsPerCell(mockData,mockData.length,globalWordChoice);

  // Preparing data for the bar chart
  const chartData = {
    labels: globalCellData.map((cell,index) => `Cell ${index}`),
    datasets: [
      {
        label: 'Number of Comments per Cell',
        data: globalCellData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const handleResetGlobalFilter = () => {
    setGlobalWordChoice(''); // 清空全局词汇选择
  };

  function CommentsWordCloud({ comments }: { comments: Comment[] }) {
    const wordFrequencies = generateWordFrequency(comments);
    let words = Object.keys(wordFrequencies).map(key => {
      return { text: key, value: wordFrequencies[key] };
    });
  
    // 对单词按频率排序并选取前10个
    words = words.sort((a, b) => b.value - a.value).slice(0, 10);
  
    // 设置词云样式和布局参数
    const options = {
      rotations: 2,
      rotationAngles: [-90, 0] as [number, number],
      fontFamily: "impact",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSizes: [50, 60] as [number, number],
      padding: 1,
      maxWords: 10,
      transitionDuration: 1000,
    };
  
    return (
      <div style={{ width: "100%", height: "200px" }}>
        <ReactWordcloud words={words} options={options}  
        callbacks={{
          getWordTooltip:(words)=>`${words.text} (${words.value})`,
          onWordClick:(word)=>{setGlobalWordChoice(word.text)}
        }}
        />
      </div>
    );
  }
  

  const codeString = codeDoc?.join('\n');

  useEffect(() => {
    setComments(mockData);
  }, [cell_type, codeDoc]); 

  const panes = [
    {
      menuItem: 'Active Cell',
      render: () => (
        <Tab.Pane attached={false}>
          <div style={{ margin: '10px 0' }}>
        <Input 
          type="text" 
          placeholder="Search comments..." 
          onChange={handleSearchChange} 
          style={{ marginRight: '10px' }}
        />
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
      <div style={{ width: '50%', height: 'auto' }}> {/* 或者其他你希望的尺寸 */}
  <CommentsBarChart data={aggregatedData} />
</div>
      <Header as='h2'>Comments</Header>
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
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Global View',
      render: () => (
        <Tab.Pane attached={false}>
          <Bar data={chartData} />
          <Button onClick={handleResetGlobalFilter}>Reset Filter</Button>
          <CommentsWordCloud comments={comments} />
          {/* 这里添加评论列表 */}
          <List divided relaxed>
            {globalCellData.map((cell,index) => (
              <List.Item key={index} onClick={()=>scrollToCell(index)}>
                <List.Content>
                  <List.Header>Cell {index}</List.Header>
                  <List.Description>
                    Comments: {cell}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Tab.Pane>
      ),
    },
    
  ];

  return (
    <Segment style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ margin: '10px 0' }}>
        <Button onClick={() => exportCommentsToCSV(filteredComments)}>Export to CSV</Button>
        <Button onClick={() => exportCommentsToPDF(filteredComments)}>Export to PDF</Button>
      </div>
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    </Segment>
  );
}  

class TeacherViewWidget extends ReactWidget {
  params: any;

  constructor(params: any) {
    super();
    this.params = params;
  }

  updateParams(newParams: any) {
    this.params = newParams;
    this.update();  // 告诉Lumino重新渲染此widget
  }

  render() {
    return <TeacherView params={this.params} />;
  }
}

export default TeacherViewWidget;
