import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/dashboard', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError(error.response?.data?.error || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!dashboardData) return <div>No data available</div>;

  const formatDate = (isoString) => {
    if (!isoString) return 'Date unavailable';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {dashboardData.username || 'User'}</h1>
      {dashboardData.lastUpdated && (
        <p>Last Updated: {formatDate(dashboardData.lastUpdated)}</p>
      )}
      
      {dashboardData.metrics && (
        <div className="metrics">
          <h2>Business Metrics</h2>
          <div>Sales: ${dashboardData.metrics.sales || 0}</div>
          <div>Customer Engagement: {dashboardData.metrics.customer_engagement || 0}%</div>
          
          {dashboardData.metrics.inventory_levels && (
            <div className="inventory">
              <h3>Inventory Levels</h3>
              {Object.entries(dashboardData.metrics.inventory_levels).map(([product, level]) => (
                <div key={product}>
                  {product}: {level} units
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;