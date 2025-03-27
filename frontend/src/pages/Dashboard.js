import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";

const Dashboard = () => {
  const [sales, setSales] = useState(0);
  const [customerEngagement, setCustomerEngagement] = useState(0);
  const [inventory, setInventory] = useState([]);
  const navigate = useNavigate();
  
  const salesChartRef = useRef(null);
  const engagementChartRef = useRef(null);
  const inventoryChartRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/");
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/dashboard");
      const data = await response.json();
      setSales(data.sales);
      setCustomerEngagement(data.customer_engagement);
      setInventory(Object.entries(data.inventory_levels));
      renderCharts(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const renderCharts = (data) => {
    if (salesChartRef.current) {
      new Chart(salesChartRef.current, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{ label: "Sales", data: [100, 200, 150, 300], borderColor: "blue", borderWidth: 2 }],
        },
      });
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Sales: ${sales}</p>
      <p>Customer Engagement: {customerEngagement}%</p>
      <h3>Inventory Levels:</h3>
      <ul>
        {inventory.map(([product, qty], index) => (
          <li key={index}>{product}: {qty} items</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
