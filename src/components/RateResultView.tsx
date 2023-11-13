import React, { useState, useEffect } from 'react';
import { Segment, Header, Statistic,Tab } from 'semantic-ui-react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement,LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,PointElement,LineElement);

function getEmojiForRating(rating: number | string): string {
  
  switch (Number(rating)) {
    case 1: return '😞'; // Or any other emoji you prefer
    case 2: return '😐';
    case 3: return '🙂';
    case 4: return '😊';
    case 5: return '😃';
    default: return '';
  }
}

interface RatingCounts {
    [key: number]: number;
  }
  
  function generateMockRatingData(): { averageRating: string, medianRating: number, ratingDistribution: RatingCounts } {
    const ratingCounts: RatingCounts = {
      1: Math.floor(Math.random() * 20),
      2: Math.floor(Math.random() * 20),
      3: Math.floor(Math.random() * 20),
      4: Math.floor(Math.random() * 20),
      5: Math.floor(Math.random() * 20)
    };
  
    const totalRatings: number = Object.entries(ratingCounts)
        .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0);
    const totalCount: number = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0);
  
    const averageRating: string = (totalRatings / totalCount).toFixed(2);
    const medianRating: number = calculateMedianRating(ratingCounts);
  
    return { averageRating, medianRating, ratingDistribution: ratingCounts };
  }
  
  function calculateMedianRating(ratingCounts: RatingCounts): number {
    const sortedRatings: number[] = [];
    Object.entries(ratingCounts).forEach(([rating, count]) => {
        for (let i = 0; i < count; i++) {
            sortedRatings.push(parseInt(rating));
        }
    });
    sortedRatings.sort((a, b) => a - b);
    const mid: number = Math.floor(sortedRatings.length / 2);
  
    return sortedRatings.length % 2 !== 0
        ? sortedRatings[mid]
        : (sortedRatings[mid - 1] + sortedRatings[mid]) / 2;
  }



function RateResultView({ params}:{params:any}) {
    const content = params?.notebookTracker?.currentWidget?.content;
    const [ratingData, setRatingData] = useState<any>(null);
    const [globalRatingData, setGlobalRatingData] = useState<any>(null);
    content.activeCellChanged.connect(() => {
      const mockData = generateMockRatingData();
      setRatingData(mockData);
      // Generate mock data for global view
      const globalMockData = generateGlobalMockRatingData(10); // Assuming we have 10 cells
      setGlobalRatingData(globalMockData);
    });

    useEffect(() => {
        // Generate mock data for individual cell view
        const mockData = generateMockRatingData();
        setRatingData(mockData);
        
        // Generate mock data for global view
        const globalMockData = generateGlobalMockRatingData(10); // Assuming we have 10 cells
        setGlobalRatingData(globalMockData);
    }, [content.activeCellIndex]);

    const panes = [
        { menuItem: 'Cell View', render: () => <Tab.Pane>{renderCellView(ratingData)}</Tab.Pane> },
        { menuItem: 'Global View', render: () => <Tab.Pane>{renderGlobalView(globalRatingData)}</Tab.Pane> },
    ];

    return (
        <Segment style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 20px)' }}>
        <Header as='h2'>Rating Results</Header>
        <Tab panes={panes} />
        </Segment>
    )


}

function renderCellView(ratingData:any) {
    if (!ratingData) {
        return <Segment loading />;
    }

    const { averageRating, medianRating, ratingDistribution } = ratingData;
    
    const chartData = {
      labels: Object.keys(ratingDistribution).map(rating => `${getEmojiForRating(rating)} (${rating})`),
      datasets: [{
          label: 'Rating Distribution',
          data: Object.values(ratingDistribution),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
      }]
  };
  

    return (
        <Segment>
            <Header as='h2'>Rating Results</Header>
            <Statistic.Group>
                <Statistic>
                    <Statistic.Value>{averageRating}</Statistic.Value>
                    <Statistic.Label>Average Rating</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>{medianRating}</Statistic.Value>
                    <Statistic.Label>Median Rating</Statistic.Label>
                </Statistic>
            </Statistic.Group>
            <Bar data={chartData} />
        </Segment>
    );
}

// function renderGlobalView(globalRatingData:any) {
//     if (!globalRatingData) {
//       return <Segment loading />;
//     }

//     const scaleDistributionCharts = Object.keys(globalRatingData.totalRatingsPerScale).map((scale:any) => {
//         const chartData = {
//             //@ts-ignore
//           labels: globalRatingData.ratingDistributions.map((_, index) => `Cell ${index + 1}`),
//           datasets: [
//             {
//               label: `Scale ${scale} Distribution`,
//               data: globalRatingData.ratingDistributions.map((dist:any) => dist[scale]),
//               backgroundColor: `rgba(${50 * scale}, ${100 + 30 * scale}, ${200 - 40 * scale}, 0.5)`,
//               borderColor: `rgba(${50 * scale}, ${100 + 30 * scale}, ${200 - 40 * scale}, 1)`,
//               borderWidth: 1
//             }
//           ]
//         };
//         return (
//           <div key={scale}>
//             <Bar data={chartData} />
//           </div>
//         );
//       });
  
//     const averageRatingChartData = {
//         //@ts-ignore
//       labels: globalRatingData.averageRatings.map((_, index) => `Cell ${index + 1}`),
//       datasets: [
//         {
//           label: 'Average Ratings per Cell',
//           data: globalRatingData.averageRatings,
//           backgroundColor: 'rgba(255, 99, 132, 0.5)',
//           borderColor: 'rgba(255, 99, 132, 1)',
//           borderWidth: 1
//         }
//       ]
//     };
  
//     const totalRatingPerScaleChartData = {
//       labels: Object.keys(globalRatingData.totalRatingsPerScale),
//       datasets: [
//         {
//           label: 'Total Ratings per Scale',
//           data: Object.values(globalRatingData.totalRatingsPerScale),
//           backgroundColor: 'rgba(153, 102, 255, 0.5)',
//           borderColor: 'rgba(153, 102, 255, 1)',
//           borderWidth: 1
//         }
//       ]
//     };
  
//     return (
//       <Segment>
//         <Header as='h3'>Global Rating Overview</Header>
//         <Bar data={averageRatingChartData} />
//         <Bar data={totalRatingPerScaleChartData} />
//         {scaleDistributionCharts}
//       </Segment>
//     );
//   }

interface GlobalRatingData {
  averageRatings: number[];
  ratingDistributions: Record<string, number>[];
}

interface GroupedData {
  averageRatings: string[];
  ratingDistributions: Record<string, number>[];
}

function renderGlobalView(globalRatingData:any) {
  if (!globalRatingData) {
    return <Segment loading />;
  }

  const averageRatings = globalRatingData.averageRatings.map(parseFloat);

  const trendChartData = {
    //@ts-ignore
    labels: averageRatings.map((_, index) => `Cell ${index + 1}`),
    datasets: [{
      label: 'Average Ratings Trend',
      data: averageRatings,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <Segment>
      <Header as='h3'>Global Rating Trend</Header>
      <Line data={trendChartData} />
    </Segment>
  );
}



function generateGlobalMockRatingData(cellCount: number) {
    const globalRatingData:any = {
      averageRatings: [],
      ratingDistributions: [],
      totalRatingsPerScale: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  
    for (let i = 0; i < cellCount; i++) {
      const cellRatingData = generateMockRatingData();
      globalRatingData.averageRatings.push(parseFloat(cellRatingData.averageRating));
  
      Object.keys(cellRatingData.ratingDistribution).forEach(scale => {
        globalRatingData.totalRatingsPerScale[scale] += cellRatingData.ratingDistribution[scale as any];
      });
  
      globalRatingData.ratingDistributions.push(cellRatingData.ratingDistribution);
    }
  
    return globalRatingData;
  }

class RateResultViewWidget extends ReactWidget {
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
        return <RateResultView params={this.params} />;
    }
}

export default RateResultViewWidget;
