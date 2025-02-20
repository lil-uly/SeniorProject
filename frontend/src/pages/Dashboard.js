import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const Dashboard = () => {
  // State variables for data
  const [sales, setSales] = useState(0);
  const [customerEngagement, setCustomerEngagement] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [recommendations] = useState(["Product A", "Product B", "Product C", "Product D"]);

  // Chart references
  const salesChartRef = useRef(null);
  const engagementChartRef = useRef(null);
  const inventoryChartRef = useRef(null);

  // Fetch dashboard data from the backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/dashboard");
      const data = await response.json();
      console.log("Dashboard Data:", data);

      // Update state
      setSales(data.sales);
      setCustomerEngagement(data.customer_engagement);
      setInventory(Object.entries(data.inventory_levels));

      // Render charts
      renderCharts(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Initialize charts
  const renderCharts = (data) => {
    if (salesChartRef.current) {
      new Chart(salesChartRef.current, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Sales",
              data: [100, 200, 150, 300], // Mock data
              borderColor: "blue",
              borderWidth: 2,
            },
          ],
        },
      });
    }

    if (engagementChartRef.current) {
      new Chart(engagementChartRef.current, {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Engagement",
              data: [50, 60, 70, 80], // Mock data
              backgroundColor: "green",
            },
          ],
        },
      });
    }

    if (inventoryChartRef.current) {
      new Chart(inventoryChartRef.current, {
        type: "pie",
        data: {
          labels: ["Product A", "Product B", "Product C", "Product D"],
          datasets: [
            {
              label: "Inventory",
              data: [30, 40, 20, 10], // Mock data
              backgroundColor: ["red", "yellow", "blue", "purple"],
            },
          ],
        },
      });
    }
  };

  // Submit an order to the backend
  const submitOrder = async (event) => {
    event.preventDefault();

    const order = {
      customerName: event.target["customer-name"].value,
      product: event.target["product"].value,
      quantity: parseInt(event.target["quantity"].value),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      const data = await response.json();
      alert("Order submitted successfully!");
    } catch (error) {
      console.error("Error submitting order:", error);
    }
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="logo">
          <img src="assets/logo.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Business Owner Dashboard */}
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

        {/* Settings */}
        <section id="settings" className="tab-content">
          <h1>Settings</h1>
          <p>Manage backups, notifications, and access control.</p>
        </section>

        {/* Customer Dashboard */}
        <section id="customer-dashboard" className="tab-content">
          <h1>Customer Dashboard</h1>
          <div>
            <h2>Order History</h2>
            <ul id="order-history"></ul>
          </div>
          <div>
            <h2>Recommendations</h2>
            <div id="recommendations" className="grid">
              {recommendations.map((item, index) => (
                <div key={index} className="card">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Dashboard Summary */}
      <div>
        <h2>Dashboard</h2>
        <p>Sales: <span>${sales}</span></p>
        <p>Customer Engagement: <span>{customerEngagement}%</span></p>
        <h3>Inventory Levels:</h3>
        <ul>
          {inventory.map(([product, qty], index) => (
            <li key={index}>{product}: {qty} items</li>
          ))}
        </ul>
      </div>

      {/* Order Submission Form */}
      <div>
        <h2>Submit an Order</h2>
        <form onSubmit={submitOrder}>
          <label htmlFor="customer-name">Customer Name:</label>
          <input id="customer-name" type="text" required />

          <label htmlFor="product">Product:</label>
          <input id="product" type="text" required />

          <label htmlFor="quantity">Quantity:</label>
          <input id="quantity" type="number" required />

          <button type="submit">Submit Order</button>
        </form>
      </div>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 Business Web App</p>
      </footer>
    </div>
  );
};

export default Dashboard;
