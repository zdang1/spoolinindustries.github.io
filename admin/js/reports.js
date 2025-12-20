/**
 * Analytics Reports Dashboard
 * Handles data loading, metrics calculation, and chart visualization
 */

let analyticsData = {
  events: [],
  dateRange: { from: null, to: null },
  charts: {},
  productCache: {}
};

let eventsCollection;
let activeVisitorsListener = null; // Real-time visitor count listener
const ACTIVE_VISITORS_COLLECTION = 'activeVisitors';
const VISITOR_TIMEOUT_MS = 120000; // 2 minutes

// Initialize analytics dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // #region agent log
  const metricsGrid = document.getElementById('metrics-grid');
  const metricCards = metricsGrid ? metricsGrid.querySelectorAll('.metric-card') : [];
  const liveVisitorsCard = document.getElementById('metric-live-visitors');
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reports.js:19',message:'DOMContentLoaded - metrics grid check',data:{metricsGridExists:!!metricsGrid,metricCardCount:metricCards.length,liveVisitorsCardExists:!!liveVisitorsCard,metricsGridHTML:metricsGrid?metricsGrid.innerHTML.substring(0,500):'not found'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const isAuthenticated = await window.firebaseHelpers.requireAuth();
  if (!isAuthenticated) return;

  if (!window.firebaseDb) {
    showAlert('Firestore is not initialized. Cannot load analytics data.', 'error');
    return;
  }

  eventsCollection = window.firebaseDb.collection('analyticsEvents');
  
  // Set default date range (last 30 days)
  setQuickDateRange(30);
  
  // Setup date range controls
  setupDateRangeControls();
  
  // Initialize charts
  initCharts();
  
  // Setup real-time visitor count
  setupRealTimeVisitorCount();
  
  // Load initial data
  await loadAnalyticsData();
  
  // #region agent log
  const metricsGridAfter = document.getElementById('metrics-grid');
  const metricCardsAfter = metricsGridAfter ? metricsGridAfter.querySelectorAll('.metric-card') : [];
  const liveVisitorsCardAfter = document.getElementById('metric-live-visitors');
  const liveCardParent = liveVisitorsCardAfter ? liveVisitorsCardAfter.closest('.metric-card') : null;
  const liveCardStyles = liveCardParent ? window.getComputedStyle(liveCardParent) : null;
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reports.js:47',message:'After initialization - metrics check',data:{metricCardCount:metricCardsAfter.length,liveVisitorsCardExists:!!liveVisitorsCardAfter,liveCardParentExists:!!liveCardParent,display:liveCardStyles?.display,visibility:liveCardStyles?.visibility,opacity:liveCardStyles?.opacity,width:liveCardStyles?.width,height:liveCardStyles?.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
});

/**
 * Setup date range slider and pickers
 */
function setupDateRangeControls() {
  const slider = document.getElementById('date-range-slider');
  const fromPicker = document.getElementById('date-from-picker');
  const toPicker = document.getElementById('date-to-picker');
  
  if (slider) {
    slider.addEventListener('input', (e) => {
      const days = parseInt(e.target.value);
      setQuickDateRange(days);
    });
  }
  
  if (fromPicker && toPicker) {
    fromPicker.addEventListener('change', () => {
      if (fromPicker.value && toPicker.value) {
        const from = new Date(fromPicker.value);
        const to = new Date(toPicker.value);
        setCustomDateRange(from, to);
      }
    });
    
    toPicker.addEventListener('change', () => {
      if (fromPicker.value && toPicker.value) {
        const from = new Date(fromPicker.value);
        const to = new Date(toPicker.value);
        setCustomDateRange(from, to);
      }
    });
  }
}

/**
 * Set quick date range (last N days)
 */
function setQuickDateRange(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  
  analyticsData.dateRange = { from, to };
  
  // Update UI
  updateDateRangeDisplay();
  
  // Update pickers
  const fromPicker = document.getElementById('date-from-picker');
  const toPicker = document.getElementById('date-to-picker');
  if (fromPicker) fromPicker.value = formatDateForInput(from);
  if (toPicker) toPicker.value = formatDateForInput(to);
  
  // Update slider
  const slider = document.getElementById('date-range-slider');
  if (slider) slider.value = days;
  
  // Reload data
  loadAnalyticsData();
}

/**
 * Set custom date range
 */
function setCustomDateRange(from, to) {
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  
  analyticsData.dateRange = { from, to };
  
  // Update UI
  updateDateRangeDisplay();
  
  // Calculate days difference for slider
  const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  const slider = document.getElementById('date-range-slider');
  if (slider && days >= 7 && days <= 365) {
    slider.value = days;
  }
  
  // Reload data
  loadAnalyticsData();
}

/**
 * Update date range display
 */
function updateDateRangeDisplay() {
  const fromDisplay = document.getElementById('date-from-display');
  const toDisplay = document.getElementById('date-to-display');
  
  if (fromDisplay) {
    fromDisplay.textContent = formatDate(analyticsData.dateRange.from);
  }
  if (toDisplay) {
    toDisplay.textContent = formatDate(analyticsData.dateRange.to);
  }
}

/**
 * Format date for display
 */
function formatDate(date) {
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format date for input
 */
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load analytics events from Firestore
 */
async function loadAnalyticsData() {
  try {
    showLoading(true);
    
    const fromTimestamp = analyticsData.dateRange.from.getTime();
    const toTimestamp = analyticsData.dateRange.to.getTime();
    
    // Query Firestore - try client_timestamp first, fallback to timestamp
    let snapshot;
    try {
      snapshot = await eventsCollection
        .where('client_timestamp', '>=', fromTimestamp)
        .where('client_timestamp', '<=', toTimestamp)
        .orderBy('client_timestamp', 'desc')
        .limit(10000)
        .get();
    } catch (error) {
      // Fallback to timestamp field if client_timestamp doesn't exist or index missing
      console.warn('Query with client_timestamp failed, trying timestamp field:', error);
      try {
        snapshot = await eventsCollection
          .where('timestamp', '>=', firebase.firestore.Timestamp.fromMillis(fromTimestamp))
          .where('timestamp', '<=', firebase.firestore.Timestamp.fromMillis(toTimestamp))
          .orderBy('timestamp', 'desc')
          .limit(10000)
          .get();
      } catch (error2) {
        // Last resort: get all and filter client-side
        console.warn('Query with timestamp failed, loading all and filtering client-side:', error2);
        snapshot = await eventsCollection
          .orderBy('timestamp', 'desc')
          .limit(10000)
          .get();
      }
    }
    
    analyticsData.events = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Handle timestamp - could be Firestore timestamp, number, or Date
      let timestamp = null;
      if (data.client_timestamp) {
        timestamp = typeof data.client_timestamp === 'number' ? data.client_timestamp : Date.now();
      } else if (data.timestamp) {
        if (data.timestamp.toMillis) {
          // Firestore timestamp
          timestamp = data.timestamp.toMillis();
        } else if (data.timestamp.toDate) {
          timestamp = data.timestamp.toDate().getTime();
        } else if (typeof data.timestamp === 'number') {
          timestamp = data.timestamp;
        } else {
          timestamp = Date.now();
        }
      } else {
        timestamp = Date.now();
      }
      
      // Filter by date range client-side if query didn't filter
      if (timestamp < fromTimestamp || timestamp > toTimestamp) {
        return; // Skip this event
      }
      
      analyticsData.events.push({
        id: doc.id,
        event_name: data.event_name || data.eventName,
        params: data.params || {},
        client_timestamp: timestamp,
        value: data.value || null,
        currency: data.currency || 'AUD',
        userId: data.user_id || data.userId || null,
        sessionId: data.session_id || data.sessionId || null
      });
    });
    
    // Process and update all visualizations
    updateAllCharts();
    showLoading(false);
  } catch (error) {
    console.error('Error loading analytics data:', error);
    showAlert('Error loading analytics data: ' + error.message, 'error');
    showLoading(false);
  }
}

/**
 * Calculate product metrics
 */
function calculateProductMetrics() {
  const metrics = {
    views: {},
    wishlist: {},
    purchases: {},
    cart: {}
  };
  
  analyticsData.events.forEach(event => {
    const eventName = event.event_name;
    const params = event.params || {};
    const productId = params.product_id;
    
    if (!productId) return;
    
    if (eventName === 'product_view') {
      metrics.views[productId] = (metrics.views[productId] || 0) + 1;
    } else if (eventName === 'add_to_wishlist') {
      metrics.wishlist[productId] = (metrics.wishlist[productId] || 0) + 1;
    } else if (eventName === 'add_to_cart') {
      metrics.cart[productId] = (metrics.cart[productId] || 0) + (params.quantity || 1);
    } else if (eventName === 'purchase' && params.items) {
      // Handle purchase events with items array
      if (Array.isArray(params.items)) {
        params.items.forEach(item => {
          const pid = item.product_id;
          if (pid) {
            metrics.purchases[pid] = (metrics.purchases[pid] || 0) + (item.quantity || 1);
          }
        });
      }
    }
  });
  
  return metrics;
}

/**
 * Calculate funnel metrics
 */
function calculateFunnelMetrics() {
  const views = analyticsData.events.filter(e => e.event_name === 'product_view').length;
  const cart = analyticsData.events.filter(e => e.event_name === 'add_to_cart').length;
  const checkout = analyticsData.events.filter(e => e.event_name === 'checkout_start').length;
  const purchase = analyticsData.events.filter(e => e.event_name === 'purchase').length;
  
  return {
    views,
    cart,
    checkout,
    purchase,
    cartRate: views > 0 ? (cart / views * 100) : 0,
    checkoutRate: cart > 0 ? (checkout / cart * 100) : 0,
    purchaseRate: checkout > 0 ? (purchase / checkout * 100) : 0,
    overallRate: views > 0 ? (purchase / views * 100) : 0
  };
}

/**
 * Generate activity heatmap data
 */
function generateActivityHeatmap(events) {
  const heatmapData = {};
  
  events.forEach(event => {
    const date = new Date(event.client_timestamp);
    const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = date.getHours();
    
    if (!heatmapData[day]) {
      heatmapData[day] = {};
    }
    heatmapData[day][hour] = (heatmapData[day][hour] || 0) + 1;
  });
  
  return heatmapData;
}

/**
 * Get product name from cache or Firestore
 */
async function getProductName(productId) {
  if (analyticsData.productCache[productId]) {
    return analyticsData.productCache[productId];
  }
  
  try {
    const productDoc = await window.firebaseDb.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const name = productDoc.data().name || productId;
      analyticsData.productCache[productId] = name;
      return name;
    }
  } catch (error) {
    console.warn('Error fetching product name:', error);
  }
  
  return productId;
}

/**
 * Initialize all Chart.js charts
 */
function initCharts() {
  // Activity Timeline Chart
  const ctx1 = document.getElementById('activity-timeline-chart');
  if (ctx1) {
    analyticsData.charts.timeline = new Chart(ctx1.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Events',
          data: [],
          borderColor: 'rgb(159, 19, 15)',
          backgroundColor: 'rgba(159, 19, 15, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#c7c7c7' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          }
        }
      }
    });
  }
  
  // Products Viewed Chart
  const ctx2 = document.getElementById('products-viewed-chart');
  if (ctx2) {
    analyticsData.charts.productsViewed = new Chart(ctx2.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Views',
          data: [],
          backgroundColor: 'rgba(159, 19, 15, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#c7c7c7' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          }
        }
      }
    });
  }
  
  // Wishlist Chart
  const ctx3 = document.getElementById('wishlist-chart');
  if (ctx3) {
    analyticsData.charts.wishlist = new Chart(ctx3.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Wishlist Adds',
          data: [],
          backgroundColor: 'rgba(203, 39, 35, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#c7c7c7' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          }
        }
      }
    });
  }
  
  // Purchased Products Chart
  const ctx4 = document.getElementById('purchased-products-chart');
  if (ctx4) {
    analyticsData.charts.purchased = new Chart(ctx4.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Purchases',
          data: [],
          backgroundColor: 'rgba(40, 167, 69, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#c7c7c7' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          }
        }
      }
    });
  }
  
  // E-commerce Funnel Chart
  const ctx5 = document.getElementById('ecommerce-funnel-chart');
  if (ctx5) {
    analyticsData.charts.funnel = new Chart(ctx5.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Product Views', 'Add to Cart', 'Checkout Started', 'Purchases'],
        datasets: [{
          label: 'Users',
          data: [0, 0, 0, 0],
          backgroundColor: [
            'rgba(159, 19, 15, 0.8)',
            'rgba(203, 39, 35, 0.8)',
            'rgba(255, 107, 107, 0.8)',
            'rgba(40, 167, 69, 0.8)'
          ]
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#c7c7c7' }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          },
          y: {
            ticks: { color: '#c7c7c7' },
            grid: { color: 'rgba(44, 44, 44, 0.5)' }
          }
        }
      }
    });
  }
}

/**
 * Update all charts and metrics
 */
async function updateAllCharts() {
  // Update metrics cards
  updateMetricsCards();
  
  // Update activity timeline
  updateActivityTimeline();
  
  // Update product charts
  await updateProductCharts();
  
  // Update funnel
  updateFunnelChart();
  
  // Update heatmaps
  renderActivityHeatmap();
}

/**
 * Setup real-time visitor count listener
 * Updates the unique visitors metric with current active visitor count
 */
function setupRealTimeVisitorCount() {
  // #region agent log
  const liveVisitorsEl = document.getElementById('metric-live-visitors');
  const liveCard = liveVisitorsEl ? liveVisitorsEl.closest('.metric-card') : null;
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reports.js:575',message:'setupRealTimeVisitorCount entry',data:{liveVisitorsElExists:!!liveVisitorsEl,liveCardExists:!!liveCard},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  if (!window.firebaseDb) {
    console.warn('Firestore not available. Real-time visitor count disabled.');
    return;
  }

  try {
    const activeVisitorsCollection = window.firebaseDb.collection(ACTIVE_VISITORS_COLLECTION);
    
    console.log('Setting up real-time visitor count listener...');
    
    // Set up real-time listener
    activeVisitorsListener = activeVisitorsCollection.onSnapshot(
      (snapshot) => {
        const now = Date.now();
        let activeCount = 0;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          let lastHeartbeat = null;
          
          // Handle timestamp conversion (could be Firestore Timestamp, number, or Date)
          if (data.lastHeartbeat) {
            if (data.lastHeartbeat.toMillis) {
              // Firestore Timestamp
              lastHeartbeat = data.lastHeartbeat.toMillis();
            } else if (data.lastHeartbeat.toDate) {
              lastHeartbeat = data.lastHeartbeat.toDate().getTime();
            } else if (typeof data.lastHeartbeat === 'number') {
              lastHeartbeat = data.lastHeartbeat;
            }
          }
          
          // Count as active if lastHeartbeat is within last 2 minutes
          if (lastHeartbeat && (now - lastHeartbeat) <= VISITOR_TIMEOUT_MS) {
            activeCount++;
          }
        });
        
        console.log(`Real-time visitor count updated: ${activeCount} active visitors`);
        
        // Update the live visitors metric with real-time count
        const liveVisitorsElement = document.getElementById('metric-live-visitors');
        if (liveVisitorsElement) {
          liveVisitorsElement.textContent = activeCount.toLocaleString();
        } else {
          console.warn('metric-live-visitors element not found');
        }
      },
      (error) => {
        console.error('Error listening to active visitors:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // On error, show 0 for live visitors
        const liveVisitorsElement = document.getElementById('metric-live-visitors');
        if (liveVisitorsElement) {
          liveVisitorsElement.textContent = '0';
        }
      }
    );
    
    console.log('Real-time visitor count listener setup complete');
  } catch (error) {
    console.error('Error setting up real-time visitor count:', error);
  }
}

/**
 * Cleanup real-time visitor listener
 */
function cleanupRealTimeVisitorCount() {
  if (activeVisitorsListener) {
    activeVisitorsListener();
    activeVisitorsListener = null;
  }
}

/**
 * Update metrics cards
 * Note: Live visitors is updated in real-time via setupRealTimeVisitorCount()
 * Unique visitors shows historical count from analyticsEvents
 */
function updateMetricsCards() {
  const pageViews = analyticsData.events.filter(e => e.event_name === 'page_view').length;
  // Historical unique visitors (from analyticsEvents in date range)
  const uniqueVisitors = new Set(analyticsData.events.map(e => e.userId || e.sessionId).filter(Boolean)).size;
  const productsViewed = analyticsData.events.filter(e => e.event_name === 'product_view').length;
  const addToCart = analyticsData.events.filter(e => e.event_name === 'add_to_cart').length;
  const purchases = analyticsData.events.filter(e => e.event_name === 'purchase').length;
  const conversionRate = productsViewed > 0 ? ((purchases / productsViewed) * 100).toFixed(2) : '0.00';
  
  document.getElementById('metric-page-views').textContent = pageViews.toLocaleString();
  document.getElementById('metric-unique-visitors').textContent = uniqueVisitors.toLocaleString();
  // metric-live-visitors is updated by real-time listener (setupRealTimeVisitorCount), not here
  document.getElementById('metric-products-viewed').textContent = productsViewed.toLocaleString();
  document.getElementById('metric-add-to-cart').textContent = addToCart.toLocaleString();
  document.getElementById('metric-purchases').textContent = purchases.toLocaleString();
  document.getElementById('metric-conversion-rate').textContent = conversionRate + '%';
}

/**
 * Update activity timeline chart
 */
function updateActivityTimeline() {
  if (!analyticsData.charts.timeline) return;
  
  // Group events by day
  const dailyData = {};
  analyticsData.events.forEach(event => {
    const date = new Date(event.client_timestamp);
    const dayKey = date.toISOString().split('T')[0];
    dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
  });
  
  // Sort by date
  const sortedDays = Object.keys(dailyData).sort();
  const labels = sortedDays.map(day => {
    const date = new Date(day);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  });
  const data = sortedDays.map(day => dailyData[day]);
  
  analyticsData.charts.timeline.data.labels = labels;
  analyticsData.charts.timeline.data.datasets[0].data = data;
  analyticsData.charts.timeline.update();
}

/**
 * Update product charts
 */
async function updateProductCharts() {
  const metrics = calculateProductMetrics();
  
  // Get top 10 most viewed
  const topViewed = Object.entries(metrics.views)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Get top 10 most wishlisted
  const topWishlist = Object.entries(metrics.wishlist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Get top 10 most purchased
  const topPurchased = Object.entries(metrics.purchases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Fetch product names
  const viewedNames = await Promise.all(topViewed.map(([id]) => getProductName(id)));
  const wishlistNames = await Promise.all(topWishlist.map(([id]) => getProductName(id)));
  const purchasedNames = await Promise.all(topPurchased.map(([id]) => getProductName(id)));
  
  // Update charts
  if (analyticsData.charts.productsViewed) {
    analyticsData.charts.productsViewed.data.labels = viewedNames;
    analyticsData.charts.productsViewed.data.datasets[0].data = topViewed.map(([, count]) => count);
    analyticsData.charts.productsViewed.update();
  }
  
  if (analyticsData.charts.wishlist) {
    analyticsData.charts.wishlist.data.labels = wishlistNames;
    analyticsData.charts.wishlist.data.datasets[0].data = topWishlist.map(([, count]) => count);
    analyticsData.charts.wishlist.update();
  }
  
  if (analyticsData.charts.purchased) {
    analyticsData.charts.purchased.data.labels = purchasedNames;
    analyticsData.charts.purchased.data.datasets[0].data = topPurchased.map(([, count]) => count);
    analyticsData.charts.purchased.update();
  }
  
  // Update product performance table
  await updateProductPerformanceTable(metrics);
}

/**
 * Update product performance table
 */
async function updateProductPerformanceTable(metrics) {
  const tbody = document.getElementById('product-performance-tbody');
  if (!tbody) return;
  
  // Get all unique product IDs
  const allProductIds = new Set([
    ...Object.keys(metrics.views),
    ...Object.keys(metrics.wishlist),
    ...Object.keys(metrics.purchases)
  ]);
  
  // Create table rows
  const rows = await Promise.all(Array.from(allProductIds).map(async (productId) => {
    const views = metrics.views[productId] || 0;
    const wishlist = metrics.wishlist[productId] || 0;
    const purchases = metrics.purchases[productId] || 0;
    const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(2) : '0.00';
    const productName = await getProductName(productId);
    
    return `
      <tr>
        <td>${escapeHtml(productName)}</td>
        <td>${views}</td>
        <td>${wishlist}</td>
        <td>${purchases}</td>
        <td>${conversionRate}%</td>
      </tr>
    `;
  }));
  
  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="color: var(--admin-text-muted);">
          No product data available for the selected date range.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = rows.join('');
  }
}

/**
 * Update funnel chart
 */
function updateFunnelChart() {
  const funnel = calculateFunnelMetrics();
  
  if (analyticsData.charts.funnel) {
    analyticsData.charts.funnel.data.datasets[0].data = [
      funnel.views,
      funnel.cart,
      funnel.checkout,
      funnel.purchase
    ];
    analyticsData.charts.funnel.update();
  }
  
  // Update funnel stats
  document.getElementById('funnel-views').textContent = funnel.views.toLocaleString();
  document.getElementById('funnel-cart').textContent = funnel.cart.toLocaleString();
  document.getElementById('funnel-cart-pct').textContent = funnel.cartRate.toFixed(1) + '%';
  document.getElementById('funnel-checkout').textContent = funnel.checkout.toLocaleString();
  document.getElementById('funnel-checkout-pct').textContent = funnel.checkoutRate.toFixed(1) + '%';
  document.getElementById('funnel-purchase').textContent = funnel.purchase.toLocaleString();
  document.getElementById('funnel-purchase-pct').textContent = funnel.purchaseRate.toFixed(1) + '%';
}

/**
 * Render activity heatmap
 */
function renderActivityHeatmap() {
  const canvas = document.getElementById('activity-heatmap');
  if (!canvas) return;
  
  const heatmapData = generateActivityHeatmap(analyticsData.events);
  const ctx = canvas.getContext('2d');
  
  // Get date range
  const days = [];
  const from = new Date(analyticsData.dateRange.from);
  const to = new Date(analyticsData.dateRange.to);
  
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().split('T')[0]);
  }
  
  if (days.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#c7c7c7';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No data available for selected date range', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  // Calculate cell size
  const cellWidth = 20;
  const cellHeight = 20;
  const cellGap = 2;
  const hours = 24;
  const maxDays = Math.min(days.length, 30); // Show max 30 days
  
  canvas.width = (cellWidth + cellGap) * hours + 80; // Extra space for day labels
  canvas.height = (cellHeight + cellGap) * maxDays + 40; // Extra space for hour labels
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Find max value for color scaling
  let maxValue = 0;
  days.slice(0, maxDays).forEach(day => {
    for (let hour = 0; hour < hours; hour++) {
      const value = (heatmapData[day] && heatmapData[day][hour]) || 0;
      if (value > maxValue) maxValue = value;
    }
  });
  
  // Draw heatmap
  days.slice(0, maxDays).forEach((day, dayIndex) => {
    for (let hour = 0; hour < hours; hour++) {
      const value = (heatmapData[day] && heatmapData[day][hour]) || 0;
      const intensity = maxValue > 0 ? value / maxValue : 0;
      
      const x = hour * (cellWidth + cellGap) + 80; // Offset for day labels
      const y = dayIndex * (cellHeight + cellGap) + 30;
      
      // Color based on intensity (red gradient)
      const r = Math.floor(159 - (60 * intensity));
      const g = Math.floor(19 + (60 * intensity));
      const b = Math.floor(15 + (20 * intensity));
      
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`;
      ctx.fillRect(x, y, cellWidth, cellHeight);
    }
    
    // Day label
    const date = new Date(day);
    ctx.fillStyle = '#c7c7c7';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }), 75, dayIndex * (cellHeight + cellGap) + 42);
  });
  
  // Hour labels
  ctx.textAlign = 'center';
  for (let hour = 0; hour < hours; hour += 6) {
    const x = hour * (cellWidth + cellGap) + 80 + cellWidth / 2;
    ctx.fillStyle = '#c7c7c7';
    ctx.font = '10px Arial';
    ctx.fillText(hour + 'h', x, 20);
  }
}

/**
 * Switch analytics tab
 */
function switchAnalyticsTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.analytics-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const tabContent = document.getElementById(tabName + '-tab-content');
  const tabButton = document.getElementById('tab-' + tabName);
  
  if (tabContent) tabContent.classList.add('active');
  if (tabButton) tabButton.classList.add('active');
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show loading state
 */
function showLoading(show) {
  const metricsGrid = document.getElementById('metrics-grid');
  if (metricsGrid) {
    if (show) {
      metricsGrid.style.opacity = '0.5';
      metricsGrid.style.pointerEvents = 'none';
    } else {
      metricsGrid.style.opacity = '1';
      metricsGrid.style.pointerEvents = 'auto';
    }
  }
}

/**
 * Show alert
 */
function showAlert(message, type = 'info') {
  // Simple alert for now - could be enhanced with a toast system
  alert(message);
}

// Cleanup real-time visitor listener on page unload
window.addEventListener('beforeunload', () => {
  cleanupRealTimeVisitorCount();
});

