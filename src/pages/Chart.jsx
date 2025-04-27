import ApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';

// Component
const Chart = () => {

  const theme = useSelector(state => state.darkLightMode.theme);

  const series = [25, 29, 13, 28, 22];

  const options = {

    chart: {
      width: 380,
      type: 'pie',
    },

    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],

    colors: theme ===
      'dark' ? ['#08528a', '#0a7852', '#9e6d0e', '#a62b3d', '#413175'] : ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],

    legend: {
      labels: {
        colors: theme === 'dark' ? '#ffffff' : '#23204a'
      }
    },

    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 400
        },
        legend: {
          position: 'bottom'
        }
      }
    }]

  };

  return (
    <div className="flex justify-center">

      <div id="chart">
        <ApexChart
          options={options}
          series={series}
          type="pie"
          width={450}
        />
      </div>

    </div>
  );
}

export default Chart;