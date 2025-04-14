import React, { useEffect, useState, useRef } from "react";
import { Chart as ChartJS, LineController, LineElement, PointElement, BarController, BarElement, ArcElement, PieController, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import "./DashboardPage.css";


// Register all necessary components and controllers
ChartJS.register(
  LineController,
  LineElement,
  PointElement,  // Register the PointElement for line charts
  BarController,  // Register the BarController for bar charts
  BarElement,
  ArcElement,
  PieController,  // Register the PieController for pie charts
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

  const [chatInput, setChatInput] = useState(''); // Chat input state
  const [chatResponses, setChatResponses] = useState([]); // Chat responses state

  const salesChartRef = useRef(null);
  const engagementChartRef = useRef(null);
  const inventoryChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const engagementChartInstance = useRef(null);
  const inventoryChartInstance = useRef(null);

  const chatContainerRef = useRef(null);

  // Scroll to the bottom of the chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatResponses]);

  // Fetch dashboard data from API
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

  // Handle chat input change
  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: chatInput }),
      });
      const data = await response.json();

      if (data.messages) {
        setChatResponses((prev) => [...prev, { user: chatInput, bot: data.messages[0].content }]);
      } else {
        setChatResponses((prev) => [...prev, { user: chatInput, bot: 'Sorry, I didn\'t understand that.' }]);
      }
    } catch (error) {
      console.error('Error communicating with chatbot:', error);
      setChatResponses((prev) => [...prev, { user: chatInput, bot: 'Error connecting to chatbot.' }]);
    }

    setChatInput('');
  };

  // Initialize charts
  useEffect(() => {
    if (salesChartRef.current && engagementChartRef.current && inventoryChartRef.current) {
      // Destroy old charts if they exist to avoid "Canvas is already in use" error
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      if (engagementChartInstance.current) engagementChartInstance.current.destroy();
      if (inventoryChartInstance.current) inventoryChartInstance.current.destroy();

      // Sales Chart Data
      salesChartInstance.current = new ChartJS(salesChartRef.current, {
        type: 'line',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Sales",
              data: [100, 200, 150, 300],
              borderColor: "blue",
              borderWidth: 2,
              pointBackgroundColor: 'red', // Optional: color for points on the line
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      // Engagement Chart Data (Bar chart)
      engagementChartInstance.current = new ChartJS(engagementChartRef.current, {
        type: 'bar',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Engagement",
              data: [50, 60, 70, 80],
              backgroundColor: "green",
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      // Inventory Chart Data (Pie chart)
      inventoryChartInstance.current = new ChartJS(inventoryChartRef.current, {
        type: 'pie',
        data: {
          labels: Object.keys(inventoryLevels),
          datasets: [
            {
              label: "Inventory",
              data: Object.values(inventoryLevels),
              backgroundColor: ["red", "yellow", "blue", "green"],
            },
          ],
        },
        options: {
          responsive: true,
        },
      });
    }
  }, [inventoryLevels]); // Re-run when inventoryLevels changes

  return (
    <div>
      <header>
        <div className="logo">
          <img src="assets/logo.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><a href="/chatbot">Chatbot</a></li>
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


        <section id="chatbot" className="tab-content">
          <h1>Chatbot</h1>
          <div className="chat-container" ref={chatContainerRef}>
            {chatResponses.map((response, index) => (
              <div key={index} className="chat-message">
                <strong>User:</strong> {response.user}
                <br />
                <strong>Bot:</strong> {response.bot}
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        </section>
      </main>


        <section id="settings" className="tab-content">
          <h1>Settings</h1>
          <p>Manage backups, notifications, and access control.</p>
        </section>
        <section id="support" className="tab-content">
          <h1>Support</h1>
          <p>Contact us for any issues or inquiries.</p>
        </section>


      <div>
        <h2>Dashboard</h2>
        <p>Sales: <span>{`$${sales}`}</span></p>
        <p>Customer Engagement: <span>{`${customerEngagement}%`}</span></p>
        <h3>Inventory Levels:</h3>
        <ul>
          {Object.keys(inventoryLevels).map((item, index) => (
            <li key={index}>{item}: {inventoryLevels[item]}</li>
          ))}
        </ul>
      </div>


      <footer>
        <p>&copy; 2025 Business Web App</p>
      </footer>
    </div>
  );
};

export default DashboardPage;



