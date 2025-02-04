// Mock data for charts and recommendations
const salesData = [100, 200, 150, 300];
const engagementData = [50, 60, 70, 80];
const inventoryData = [30, 40, 20, 10];

const recommendations = [
  "Product A", "Product B", "Product C", "Product D"
];

// Initialize charts
document.addEventListener("DOMContentLoaded", () => {
  renderCharts();
  renderRecommendations();
});

function renderCharts() {
  // Sales Chart
  const ctxSales = document.getElementById("salesChart").getContext("2d");
  new Chart(ctxSales, {
    type: 'line',
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        label: 'Sales',
        data: salesData,
        borderColor: 'blue',
        borderWidth: 2
      }]
    }
  });

  // Engagement Chart
  const ctxEngagement = document.getElementById("engagementChart").getContext("2d");
  new Chart(ctxEngagement, {
    type: 'bar',
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        label: 'Engagement',
        data: engagementData,
        backgroundColor: 'green'
      }]
    }
  });

  // Inventory Chart
  const ctxInventory = document.getElementById("inventoryChart").getContext("2d");
  new Chart(ctxInventory, {
    type: 'pie',
    data: {
      labels: ["Product A", "Product B", "Product C", "Product D"],
      datasets: [{
        label: 'Inventory',
        data: inventoryData,
        backgroundColor: ['red', 'yellow', 'blue', 'purple']
      }]
    }
  });
}

function renderRecommendations() {
  const recContainer = document.getElementById("recommendations");
  recommendations.forEach(item => {
    const recItem = document.createElement("div");
    recItem.textContent = item;
    recItem.classList.add("card");
    recContainer.appendChild(recItem);
  });
}
// Fetch dashboard data from the backend
function fetchDashboardData() {
  fetch("http://127.0.0.1:5000/api/dashboard")
    .then(response => response.json())
    .then(data => {
      console.log("Dashboard Data:", data);
      // Update the dashboard on the front-end
      document.getElementById("sales").textContent = `$${data.sales}`;
      document.getElementById("customer-engagement").textContent = `${data.customer_engagement}%`;
      const inventory = document.getElementById("inventory");
      inventory.innerHTML = ""; // Clear inventory list
      for (const [product, qty] of Object.entries(data.inventory_levels)) {
        const item = document.createElement("li");
        item.textContent = `${product}: ${qty} items`;
        inventory.appendChild(item);
      }
    })
    .catch(error => console.error("Error fetching dashboard data:", error));
}
// Submit an order to the backend
function submitOrder() {
  const order = {
    customerName: document.getElementById("customer-name").value,
    product: document.getElementById("product").value,
    quantity: parseInt(document.getElementById("quantity").value)
  };

  fetch("http://127.0.0.1:5000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      alert("Order submitted successfully!");
    })
    .catch(error => console.error("Error submitting order:", error));
}
