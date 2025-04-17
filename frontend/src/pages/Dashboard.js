import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  LineController,
  PieController,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import jsPDF from "jspdf";
import "./DashboardPage.css";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [compareYears, setCompareYears] = useState({ year1: "", year2: "" });
  const [insights, setInsights] = useState({});
  const salesChartRef = useRef(null);
  const compareChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const compareChartInstance = useRef(null);
  const productChartRef = useRef(null);
  const productChartInstance = useRef(null);
  const demographicsChartRef = useRef(null);
  const demographicsChartInstance = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (!token) return;

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const name = decoded["custom:businessName"];
    setBusinessName(name);

    fetch("https://cnj7gaspn5.execute-api.us-east-1.amazonaws.com/get-business-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ business_name: name }),
    })
      .then((res) => res.json())
      .then((data) => {
        const items = data.items || [];
        setSalesData(items);
        if (items.length > 0) setSelectedYear(items[0].year);
      })
      .catch((err) => console.error("Failed to fetch business data:", err));
  }, []);

  useEffect(() => {
    if (!salesData.length || !salesChartRef.current || !selectedYear) return;

    if (salesChartInstance.current) salesChartInstance.current.destroy();

    const filtered = salesData.find((row) => row.year === selectedYear);
    if (!filtered) return;

    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = months.map((m) => parseFloat(filtered[m] || 0));

    salesChartInstance.current = new ChartJS(salesChartRef.current, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: `Monthly Revenue (${selectedYear})`,
            data: revenueData,
            borderColor: "#82aaff",
            backgroundColor: "rgba(130, 170, 255, 0.2)",
            borderWidth: 2,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#82aaff",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#333",
            },
          },
          title: {
            display: true,
            text: `Monthly Revenue for ${businessName}`,
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
    // --- Calculate Best/Worst Month and Forecast ---
    const maxValue = Math.max(...revenueData);
    const minValue = Math.min(...revenueData);
    const maxMonth = monthLabels[revenueData.indexOf(maxValue)];
    const minMonth = monthLabels[revenueData.indexOf(minValue)];
    const avgGrowth = ((revenueData[11] - revenueData[0]) / 11).toFixed(2);
    const forecast = revenueData[11] + parseFloat(avgGrowth);

    setInsights(prev => ({
      ...prev,
      bestMonth: { month: maxMonth, value: maxValue },
      worstMonth: { month: minMonth, value: minValue },
      forecast: forecast.toFixed(2),
    }));

    // --- Product Breakdown Chart (using sample data) ---
    if (productChartInstance.current) productChartInstance.current.destroy();

    const productLabels = ["Product A", "Product B", "Product C"];
    const productData = [32000, 24000, 18000];

    productChartInstance.current = new ChartJS(productChartRef.current, {
      type: "pie",
      data: {
        labels: productLabels,
        datasets: [{
          label: "Product Breakdown",
          data: productData,
          backgroundColor: ["#4dc9f6", "#f67019", "#f53794"],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
    // --- Customer Demographics Chart ---
    if (demographicsChartInstance.current) demographicsChartInstance.current.destroy();

    const demographicLabels = ["18-24", "25-34", "35-44", "45-54", "55+"];
    const demographicData = [25, 35, 20, 12, 8]; // percentage

    demographicsChartInstance.current = new ChartJS(demographicsChartRef.current, {
      type: "pie",
      data: {
        labels: demographicLabels,
        datasets: [{
          label: "Customer Demographics",
          data: demographicData,
          backgroundColor: ["#ffd54f", "#4fc3f7", "#81c784", "#ba68c8", "#e57373"],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Customer Demographics (by Age Group)",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    });


  }, [salesData, selectedYear, businessName]);

  useEffect(() => {
    if (!compareYears.year1 || !compareYears.year2 || !compareChartRef.current) return;

    if (compareChartInstance.current) compareChartInstance.current.destroy();

    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const year1Data = salesData.find(row => row.year === compareYears.year1);
    const year2Data = salesData.find(row => row.year === compareYears.year2);

    if (!year1Data || !year2Data) return;

    const dataset1 = months.map(m => parseFloat(year1Data[m] || 0));
    const dataset2 = months.map(m => parseFloat(year2Data[m] || 0));

    const total1 = dataset1.reduce((a, b) => a + b, 0);
    const total2 = dataset2.reduce((a, b) => a + b, 0);
    const diff = total2 - total1;
    const percentChange = ((diff / total1) * 100).toFixed(2);

    setInsights(prev => ({
      ...prev,
      year1: compareYears.year1,
      year2: compareYears.year2,
      total1,
      total2,
      diff,
      percentChange,
    }));

    compareChartInstance.current = new ChartJS(compareChartRef.current, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: `${compareYears.year1} Revenue`,
            data: dataset1,
            borderColor: "#66b2ff",
            backgroundColor: "rgba(102, 178, 255, 0.2)",
            tension: 0.3,
          },
          {
            label: `${compareYears.year2} Revenue`,
            data: dataset2,
            borderColor: "#ff9933",
            backgroundColor: "rgba(255, 153, 51, 0.2)",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Revenue Comparison: ${compareYears.year1} vs ${compareYears.year2}`,
          },
        },
      },
    });
  }, [compareYears, salesData]);

  const availableYears = [...new Set(salesData.map((item) => item.year))];

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Revenue Insights Report", 20, 20);

    if (insights.year1 && insights.year2) {
      doc.text(`Business: ${businessName}`, 20, 30);
      doc.text(`Compared Years: ${insights.year1} vs ${insights.year2}`, 20, 40);
      doc.text(`Total Revenue in ${insights.year1}: $${insights.total1.toLocaleString()}`, 20, 50);
      doc.text(`Total Revenue in ${insights.year2}: $${insights.total2.toLocaleString()}`, 20, 60);
      doc.text(`Change: $${insights.diff.toLocaleString()} (${insights.percentChange}%)`, 20, 70);

      const suggestion = insights.diff > 0
        ? "Revenue increased! Consider reinvesting in growth strategies."
        : "Revenue declined. Consider investigating low-performing months or campaigns.";
      doc.text(`Insight: ${suggestion}`, 20, 80);
    }

    doc.save("revenue-insights.pdf");
  };

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
              <h2>Monthly Revenue</h2>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="year-select">Select Year: </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <canvas ref={salesChartRef}></canvas>
            </div>

            <div className="card" style={{ marginTop: "3rem" }}>
              <h2>Compare Revenue Across Years</h2>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <select
                  value={compareYears.year1}
                  onChange={(e) => setCompareYears((prev) => ({ ...prev, year1: e.target.value }))}
                >
                  <option value="">Select Year 1</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={compareYears.year2}
                  onChange={(e) => setCompareYears((prev) => ({ ...prev, year2: e.target.value }))}
                >
                  <option value="">Select Year 2</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <canvas ref={compareChartRef}></canvas>

              {insights.year1 && insights.year2 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4>Insights:</h4>
                  <p>Total Revenue in {insights.year1}: ${insights.total1.toLocaleString()}</p>
                  <p>Total Revenue in {insights.year2}: ${insights.total2.toLocaleString()}</p>
                  <p>Change: ${insights.diff.toLocaleString()} ({insights.percentChange}%)</p>
                  <p>
                    {insights.diff > 0
                      ? "📈 Revenue increased! Consider reinvesting in growth strategies."
                      : "📉 Revenue declined. Consider investigating low-performing months or campaigns."}
                  </p>
                  <button onClick={exportToPDF} style={{ marginTop: "1rem" }}>📄 Export Insights to PDF</button>
                </div>
              )}
              <div className="card">
                <h2>Top Product Revenue</h2>
                <canvas ref={productChartRef}></canvas>
                <p style={{ marginTop: "1rem" }}>🏆 Top Product: Product A ($32,000)</p>
              </div>

              <div className="card" style={{ marginTop: "2rem" }}>
                <h3>Additional Insights</h3>
                {insights.bestMonth && insights.worstMonth && (
                  <div>
                    <p>📈 Best Month: {insights.bestMonth.month} (${insights.bestMonth.value.toLocaleString()})</p>
                    <p>📉 Worst Month: {insights.worstMonth.month} (${insights.worstMonth.value.toLocaleString()})</p>
                    <p>🔮 Forecasted Revenue (Next Month): ${insights.forecast}</p>
                  </div>
                )}
              </div>
              <div className="card">
                <h2>Customer Demographics</h2>
                <canvas ref={demographicsChartRef}></canvas>
                <p style={{ marginTop: "1rem" }}>👥 Largest Segment: 25–34 years old (35%)</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 Business Web App</p>
      </footer>
    </div>
  );
};

export default DashboardPage;

