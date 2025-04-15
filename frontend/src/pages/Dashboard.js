import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  ArcElement,
  PieController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "./DashboardPage.css";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  ArcElement,
  PieController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [sales, setSales] = useState(0);
  const [customerEngagement, setCustomerEngagement] = useState(0);
  const [inventoryLevels, setInventoryLevels] = useState({});
  const [recommendations] = useState(["Product A", "Product B", "Product C", "Product D"]);

  const salesChartRef = useRef(null);
  const engagementChartRef = useRef(null);
  const inventoryChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const engagementChartInstance = useRef(null);
  const inventoryChartInstance = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/dashboard")
      .then(response => response.json())
      .then(data => {
        setSales(data.sales);
        setCustomerEngagement(data.customer_engagement);
        setInventoryLevels(data.inventory_levels);
      })
      .catch(error => console.error("Error fetching dashboard data:", error));
  }, []);

  useEffect(() => {
    if (salesChartRef.current && engagementChartRef.current && inventoryChartRef.current) {
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      if (engagementChartInstance.current) engagementChartInstance.current.destroy();
      if (inventoryChartInstance.current) inventoryChartInstance.current.destroy();

      salesChartInstance.current = new ChartJS(salesChartRef.current, {
        type: 'line',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: "Sales",
            data: [100, 200, 150, 300],
            borderColor: "#82aaff",
            backgroundColor: "rgba(130, 170, 255, 0.2)",
            borderWidth: 2,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#82aaff",
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#333",
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#666" },
              grid: { color: "rgba(130, 170, 255, 0.1)" },
            },
            y: {
              ticks: { color: "#666" },
              grid: { color: "rgba(130, 170, 255, 0.1)" },
            },
          },
        },
      });

      engagementChartInstance.current = new ChartJS(engagementChartRef.current, {
        type: 'bar',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: "Engagement",
            data: [50, 60, 70, 80],
            backgroundColor: "rgba(102, 178, 255, 0.6)",
            borderColor: "#66b2ff",
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#333",
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#666" },
              grid: { color: "rgba(130, 170, 255, 0.1)" },
            },
            y: {
              ticks: { color: "#666" },
              grid: { color: "rgba(130, 170, 255, 0.1)" },
            },
          },
        },
      });

      inventoryChartInstance.current = new ChartJS(inventoryChartRef.current, {
        type: 'pie',
        data: {
          labels: Object.keys(inventoryLevels),
          datasets: [{
            label: "Inventory",
            data: Object.values(inventoryLevels),
            backgroundColor: [
              "#cce5ff",
              "#b3d1ff",
              "#99ccff",
              "#80bfff",
              "#66b2ff",
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#333",
              },
            },
          },
        },
      });
    }
  }, [inventoryLevels]);

  return (
    <div>
      <header>
        <div className="logo">
          <img src="assets/logo.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="dashboard" className="tab-content active">
          <h1>Performance Dashboard</h1>
          <div className="dashboard-cards">
            <div className="card">
              <h2>Sales</h2>
              <canvas ref={salesChartRef}></canvas>
            </div>
            <div className="card">
              <h2>Customer Engagement</h2>
              <canvas ref={engagementChartRef}></canvas>
            </div>
            <div className="card">
              <h2>Inventory</h2>
              <canvas ref={inventoryChartRef}></canvas>
            </div>
          </div>
        </section>

        <section id="settings" className="tab-content">
          <h1>Settings</h1>
          <p>Manage backups, notifications, and access control.</p>
        </section>

        <section id="customer-dashboard" className="tab-content">
          <h1>Customer Dashboard</h1>
          <div>
            <h2>Order History</h2>
            <ul id="order-history"></ul>
          </div>
          <div>
            <h2>Recommendations</h2>
            <div id="recommendations" className="grid"></div>
          </div>
        </section>
      </main>

      <div>
        <h1>Metrics</h1>
        <div className="stat-section">
          <div className="stat-block sales">
            <h3>Sales</h3>
            <p>${sales.toLocaleString()}</p>
          </div>
          <div className="stat-block engagement">
            <h3>Customer Engagement</h3>
            <p>{customerEngagement}%</p>
          </div>
        </div>
        <h3>Inventory Levels:</h3>
        {Object.keys(inventoryLevels).map((item, index) => {
          const value = inventoryLevels[item];
          const percent = Math.min((value / 100) * 100, 100); // Assuming 100 is max inventory for visual purposes

          return (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div className="metric-label">{item}: {value}</div>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <footer>
        <p>&copy; 2025 Business Web App</p>
      </footer>
    </div>
  );
};

export default DashboardPage;




