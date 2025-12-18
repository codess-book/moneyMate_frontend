import { Bar, Pie } from 'react-chartjs-2';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,PointElement,LineElement } from 'chart.js';
import styles from '../styles/DashChart.module.css';
import { Line } from "react-chartjs-2";
const apiBaseUrl = import.meta.env.VITE_API_URL;



Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,PointElement,LineElement);

const DashChart = () => {
  const [data, setData] = useState({
    monthlyRevenue: [],
    monthlyCustomers: [],
    paidUnpaid: { totalPaid: 0, totalUnpaid: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const [totalSale, setTotalSale] = useState(0);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


  //for monthly revenu..
const [charts, setCharts] = useState({
    revenue: {
      labels: MONTHS,
      datasets: [{
        label: "Revenue",
        data: Array(12).fill(0),  // default 0s
        backgroundColor: "#4caf50",
      }]
    }
  });

  const [totalRevenue, setTotalRevenue] = useState(0);
useEffect(() => {
  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch( `${apiBaseUrl}/api/chart/revenue-and-sales`,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    const data2 = await res.json();

if (!Array.isArray(data2.revenue) || !Array.isArray(data2.sales)) {
  throw new Error("Expected arrays for both revenue and sales");
}

//const total = data2.revenue.reduce((sum, val) => sum + val, 0);

const totalRevenue = data2.revenue.reduce((sum, val) => sum + val, 0);
const totalSale = data2.sales.reduce((sum, val) => sum + val, 0);
setTotalRevenue(totalRevenue);
setTotalSale(totalSale);

setCharts(prev => ({
  ...prev,
  revenue: {
    labels: MONTHS,
    datasets: [
      {
        label: "Revenue",
        data: data2.revenue,
        backgroundColor: "#4caf50"
      },
      {
        label: "Total Sales",
        data: data2.sales,
        backgroundColor: "#2196f3"
      }
    ]
  }
}));


      setTotalRevenue(totalRevenue);

    } catch (err) {
      console.error("Revenue load failed:", err);
    }
  };

  fetchRevenue();
}, []);

const [customerGrowth, setCustomerGrowth] = useState(Array(12).fill(0));
const [totalCustomers, setTotalCustomers] = useState(0);

useEffect(() => {
  const fetchCustomerGrowth = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBaseUrl}/api/chart/customer-growth`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();

       if (result.success) {
        setCustomerGrowth(result.data);
        setTotalCustomers(result.total);
      } else {
        throw new Error("Failed to fetch customer stats");
      }
      if (!Array.isArray(result.data)) throw new Error("Expected array");

      //setCustomerGrowth(result.data);
    } catch (err) {
      console.error("Customer growth load failed:", err);
    }
  };

  fetchCustomerGrowth();
}, []);
    
return (
  <div className={styles.dashboard}>
    <header className={styles.header}>
      <h1>Business Dashboard</h1>
      <p className={styles.subtitle}>Overview of your business performance</p>
    </header>

    <div className={styles.grid}>
      {/* Revenue Card */}
      <div className={`${styles.card} ${styles.revenue}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.revenueIcon}`}>
            <span>₹</span>
          </div>
          <div className={styles.cardTitle}>
            <h2>Monthly Revenue & Sales</h2>
            <p className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.green}`}></span>
                Revenue
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.blue}`}></span>
                Total Sale
              </span>
            </p>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <Bar 
            data={charts.revenue}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: {
                      size: 12
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString()}`,
                  },
                  displayColors: true,
                  backgroundColor: '#2d3748',
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 12
                  },
                  padding: 12,
                  cornerRadius: 8
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  },
                  ticks: {
                    callback: (value) => `₹${value.toLocaleString()}`,
                    font: {
                      size: 11
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      size: 11
                    }
                  }
                }
              }
            }}
          />
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Revenue:</span>
              <span className={styles.statValue}>₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className={styles.statDivider}>|</div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Sale:</span>
              <span className={styles.statValue}>₹{totalSale.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Card */}
      <div className={`${styles.card} ${styles.customers}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.cardIcon} ${styles.customersIcon}`}>
            <span>👥</span>
          </div>
          <div className={styles.cardTitle}>
            <h2>Customer Growth</h2>
            <p className={styles.legend}>New signups by month</p>
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <Line 
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              datasets: [
                {
                  label: "New Customers",
                  data: customerGrowth,
                  borderColor: "#03a9f4",
                  backgroundColor: "rgba(3, 169, 244, 0.2)",
                  tension: 0.3,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#03a9f4',
                  pointBorderWidth: 2
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  display: true,
                  labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: {
                      size: 12
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `New Customers: ${ctx.raw}`,
                  },
                  displayColors: false,
                  backgroundColor: '#2d3748',
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 12
                  },
                  padding: 12,
                  cornerRadius: 8
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  },
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: 11
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      size: 11
                    }
                  }
                }
              }
            }}
          />
        </div>
        
        <div className={styles.cardFooter}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total:</span>
              <span className={styles.statValue}>{totalCustomers.toLocaleString()} customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default DashChart;













 {/* Payments Card */}
        {/*<div className={`${styles.card} ${styles.payments}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <span>💳</span>
            </div>
            <div>
              <h2>Payment Status</h2>
              <p>Paid vs unpaid amounts</p>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <Pie 
              data={charts.payments}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: window.innerWidth < 768 ? 'bottom' : 'right',
                  }
                }
              }}
            />
          </div>
          <div className={styles.cardStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Paid</span>
              <span className={styles.statValue}>
                ₹{data.paidUnpaid.totalPaid.toLocaleString()} <span>({paidRatio}%)</span>
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Unpaid</span>
              <span className={styles.statValue}>
                ₹{data.paidUnpaid.totalUnpaid.toLocaleString()} <span>({unpaidRatio}%)</span>
              </span>
            </div>
          </div>
        </div>*/}

        {/* Summary Card */}
        {/*<div className={`${styles.card} ${styles.summary}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <span>📊</span>
            </div>
            <div>
              <h2>Performance Summary</h2>
              <p>Key business metrics</p>
            </div>
          </div>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}>₹</div>
              <div>
                <h3>Total Revenue</h3>
                <p>₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}>👥</div>
              <div>
                <h3>Total Customers</h3>
                <p>{totalCustomers.toLocaleString()}</p>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryIcon}>✅</div>
              <div>
                <h3>Payment Success</h3>
                <p>{paidRatio}%</p>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={`${styles.summaryIcon} ${growth.trend === 'up' ? styles.up : growth.trend === 'down' ? styles.down : ''}`}>
                {growth.trend === 'up' ? '📈' : growth.trend === 'down' ? '📉' : '➖'}
              </div>
              <div>
                <h3>Revenue Growth</h3>
                <p>{growth.value}</p>
              </div>
            </div>
          </div>
        </div>
      </div>*/}