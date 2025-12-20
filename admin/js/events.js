/**
 * Events Explorer - Analytics Events Management
 * Loads, filters, and analyzes analytics events from Firestore
 */

let eventsCollection;
let allEvents = [];
let filteredEvents = [];
let currentPage = 1;
const eventsPerPage = 50;
let funnelChart = null;

// Wait for Firebase to be initialized
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const isAuthenticated = await window.firebaseHelpers.requireAuth();
  if (!isAuthenticated) return;

  // Initialize events management
  await initEvents();
});

/**
 * Initialize events management
 */
async function initEvents() {
  try {
    // Check if Firestore is available
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized. Please check Firebase configuration.');
    }

    eventsCollection = window.firebaseDb.collection('analyticsEvents');

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('date-from-filter').valueAsDate = thirtyDaysAgo;
    document.getElementById('date-to-filter').valueAsDate = today;
    document.getElementById('funnel-date-from').valueAsDate = thirtyDaysAgo;
    document.getElementById('funnel-date-to').valueAsDate = today;

    // Load events
    await loadEvents();

    // Load unique event names for filter dropdown
    await loadEventNames();

    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing events:', error);
    showAlert('Error loading events. Please refresh the page.', 'error');
  }
}

/**
 * Load events from Firestore
 */
async function loadEvents() {
  try {
    const tbody = document.getElementById('events-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            <div class="loading"></div>
            <p style="margin-top: 10px; color: var(--admin-text-muted);">Loading events...</p>
          </td>
        </tr>
      `;
    }

    // Query events ordered by timestamp descending
    const snapshot = await eventsCollection
      .orderBy('timestamp', 'desc')
      .limit(1000) // Limit to most recent 1000 events
      .get();

    allEvents = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      allEvents.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to Date
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp || new Date())
      });
    });

    // Apply filters
    applyFilters();
  } catch (error) {
    console.error('Error loading events:', error);
    const tbody = document.getElementById('events-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="color: var(--admin-red-primary);">
            Error loading events: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Load unique event names for filter dropdown
 */
async function loadEventNames() {
  try {
    const snapshot = await eventsCollection
      .orderBy('eventName')
      .get();

    const eventNames = new Set();
    snapshot.forEach(doc => {
      const eventName = doc.data().eventName;
      if (eventName) {
        eventNames.add(eventName);
      }
    });

    const select = document.getElementById('event-name-filter');
    const sortedNames = Array.from(eventNames).sort();
    
    sortedNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading event names:', error);
  }
}

/**
 * Apply filters to events
 */
function applyFilters() {
  const eventNameFilter = document.getElementById('event-name-filter').value;
  const dateFromFilter = document.getElementById('date-from-filter').value;
  const dateToFilter = document.getElementById('date-to-filter').value;
  const userFilter = document.getElementById('user-filter').value.toLowerCase();

  filteredEvents = allEvents.filter(event => {
    // Event name filter
    if (eventNameFilter && event.eventName !== eventNameFilter) {
      return false;
    }

    // Date range filter
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      if (event.timestamp < fromDate) {
        return false;
      }
    }
    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (event.timestamp > toDate) {
        return false;
      }
    }

    // User filter
    if (userFilter && event.userId) {
      if (!event.userId.toLowerCase().includes(userFilter)) {
        return false;
      }
    }

    return true;
  });

  currentPage = 1;
  renderEvents();
  updatePagination();
}

/**
 * Clear all filters
 */
function clearFilters() {
  document.getElementById('event-name-filter').value = '';
  document.getElementById('date-from-filter').value = '';
  document.getElementById('date-to-filter').value = '';
  document.getElementById('user-filter').value = '';
  
  // Reset to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  document.getElementById('date-from-filter').valueAsDate = thirtyDaysAgo;
  document.getElementById('date-to-filter').valueAsDate = today;

  applyFilters();
}

/**
 * Render events table
 */
function renderEvents() {
  const tbody = document.getElementById('events-tbody');
  if (!tbody) return;

  if (filteredEvents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center" style="color: var(--admin-text-muted);">
          No events found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const pageEvents = filteredEvents.slice(startIndex, endIndex);

  tbody.innerHTML = pageEvents.map(event => {
    const timestamp = event.timestamp instanceof Date 
      ? event.timestamp.toLocaleString() 
      : new Date(event.timestamp).toLocaleString();
    
    const params = event.params || {};
    const paramsStr = Object.keys(params).length > 0
      ? JSON.stringify(params).substring(0, 100) + (JSON.stringify(params).length > 100 ? '...' : '')
      : '—';
    
    const value = params.value !== undefined ? `$${parseFloat(params.value || 0).toLocaleString()}` : '—';
    const userId = event.userId ? event.userId.substring(0, 8) + '...' : '—';

    return `
      <tr>
        <td><code style="color: var(--admin-red-secondary);">${escapeHtml(event.eventName || '—')}</code></td>
        <td>${timestamp}</td>
        <td>${userId}</td>
        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(paramsStr)}">${escapeHtml(paramsStr)}</td>
        <td>${value}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewEventDetails('${event.id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const pagination = document.getElementById('events-pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  
  // Previous button
  html += `
    <button class="btn btn-sm btn-secondary" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i> Previous
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `
        <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<span style="padding: 8px;">...</span>`;
    }
  }

  // Next button
  html += `
    <button class="btn btn-sm btn-secondary" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;

  pagination.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderEvents();
  updatePagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * View event details
 */
function viewEventDetails(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) {
    showAlert('Event not found.', 'error');
    return;
  }

  const modal = document.getElementById('event-detail-modal');
  const content = document.getElementById('event-detail-content');

  const timestamp = event.timestamp instanceof Date 
    ? event.timestamp.toLocaleString() 
    : new Date(event.timestamp).toLocaleString();

  content.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: var(--admin-red-secondary); margin-bottom: 10px;">${escapeHtml(event.eventName || 'Unknown Event')}</h3>
      <p style="color: var(--admin-text-muted); font-size: 0.9rem;">Event ID: ${event.id}</p>
    </div>

    <div style="display: grid; gap: 15px;">
      <div>
        <label class="form-label">Timestamp</label>
        <div style="padding: 10px; background: var(--admin-border); border-radius: 4px;">${timestamp}</div>
      </div>

      <div>
        <label class="form-label">User ID</label>
        <div style="padding: 10px; background: var(--admin-border); border-radius: 4px;">${event.userId || '—'}</div>
      </div>

      <div>
        <label class="form-label">Session ID</label>
        <div style="padding: 10px; background: var(--admin-border); border-radius: 4px;">${event.sessionId || '—'}</div>
      </div>

      <div>
        <label class="form-label">Page URL</label>
        <div style="padding: 10px; background: var(--admin-border); border-radius: 4px; word-break: break-all;">${escapeHtml(event.pageUrl || '—')}</div>
      </div>

      <div>
        <label class="form-label">Parameters</label>
        <pre style="padding: 15px; background: var(--admin-border); border-radius: 4px; overflow-x: auto; max-height: 400px;">${JSON.stringify(event.params || {}, null, 2)}</pre>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

/**
 * Close event detail modal
 */
function closeEventDetailModal() {
  const modal = document.getElementById('event-detail-modal');
  modal.classList.remove('active');
}

/**
 * Switch between tabs
 */
function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = 'none';
  });
  
  const content = document.getElementById(`${tab}-tab-content`);
  if (content) {
    content.classList.add('active');
    content.style.display = 'block';
  }

  // Load funnel data if switching to funnels tab
  if (tab === 'funnels') {
    loadFunnelData();
  }
}

/**
 * Load funnel data and render chart
 */
async function loadFunnelData() {
  const funnelType = document.getElementById('funnel-select').value;
  const dateFrom = document.getElementById('funnel-date-from').value;
  const dateTo = document.getElementById('funnel-date-to').value;

  try {
    // Define funnel steps based on type
    let steps = [];
    if (funnelType === 'lead_to_quote') {
      steps = [
        { event: 'quote_request_start', label: 'Quote Request Started' },
        { event: 'quote_request_submit', label: 'Quote Submitted' }
      ];
    } else if (funnelType === 'quote_to_job') {
      steps = [
        { event: 'quote_accepted', label: 'Quote Accepted' },
        { event: 'create_job', label: 'Job Created' }
      ];
    } else if (funnelType === 'job_to_invoice') {
      steps = [
        { event: 'job_complete', label: 'Job Completed' },
        { event: 'create_invoice', label: 'Invoice Created' }
      ];
    }

    // Filter events by date range
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    toDate?.setHours(23, 59, 59, 999);

    const funnelEvents = allEvents.filter(event => {
      if (fromDate && event.timestamp < fromDate) return false;
      if (toDate && event.timestamp > toDate) return false;
      return steps.some(step => step.event === event.eventName);
    });

    // Count events for each step
    const stepCounts = steps.map(step => {
      const count = funnelEvents.filter(e => e.eventName === step.event).length;
      return { ...step, count };
    });

    // Calculate conversion rates
    const metrics = [];
    for (let i = 0; i < stepCounts.length; i++) {
      const current = stepCounts[i];
      const previous = i > 0 ? stepCounts[i - 1] : null;
      const conversionRate = previous && previous.count > 0
        ? ((current.count / previous.count) * 100).toFixed(1)
        : '100.0';
      const dropOff = previous && previous.count > 0
        ? previous.count - current.count
        : 0;

      metrics.push({
        ...current,
        conversionRate,
        dropOff
      });
    }

    // Render funnel chart
    renderFunnelChart(stepCounts, metrics);
    renderFunnelMetrics(metrics);
  } catch (error) {
    console.error('Error loading funnel data:', error);
    showAlert('Error loading funnel data. Please try again.', 'error');
  }
}

/**
 * Render funnel chart using Chart.js
 */
function renderFunnelChart(stepCounts, metrics) {
  const canvas = document.getElementById('funnel-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Destroy existing chart if it exists
  if (funnelChart) {
    funnelChart.destroy();
  }

  const labels = stepCounts.map(s => s.label);
  const data = stepCounts.map(s => s.count);
  const colors = stepCounts.map((_, i) => {
    const alpha = 1 - (i * 0.15);
    return `rgba(159, 19, 15, ${alpha})`;
  });

  funnelChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Event Count',
        data: data,
        backgroundColor: colors,
        borderColor: 'rgba(159, 19, 15, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const index = context.dataIndex;
              if (index > 0 && metrics[index]) {
                return `Conversion: ${metrics[index].conversionRate}%`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * Render funnel metrics
 */
function renderFunnelMetrics(metrics) {
  const container = document.getElementById('funnel-metrics');
  if (!container) return;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
      ${metrics.map((metric, index) => `
        <div style="background: var(--admin-border); padding: 15px; border-radius: 8px;">
          <div style="color: var(--admin-text-muted); font-size: 0.9rem; margin-bottom: 5px;">${escapeHtml(metric.label)}</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: var(--admin-red-secondary);">${metric.count}</div>
          ${index > 0 ? `
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--admin-text-muted);">
              Conversion: ${metric.conversionRate}%<br>
              Drop-off: ${metric.dropOff}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Export events
 */
function exportEvents(format) {
  if (filteredEvents.length === 0) {
    showAlert('No events to export.', 'warning');
    return;
  }

  try {
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'json') {
      exportToJSON();
    }
  } catch (error) {
    console.error('Error exporting events:', error);
    showAlert('Error exporting events. Please try again.', 'error');
  }
}

/**
 * Export to CSV
 */
function exportToCSV() {
  const headers = ['Event Name', 'Timestamp', 'User ID', 'Session ID', 'Page URL', 'Parameters', 'Value'];
  const rows = filteredEvents.map(event => {
    const timestamp = event.timestamp instanceof Date 
      ? event.timestamp.toISOString() 
      : new Date(event.timestamp).toISOString();
    const params = JSON.stringify(event.params || {});
    const value = event.params?.value || '';
    
    return [
      event.eventName || '',
      timestamp,
      event.userId || '',
      event.sessionId || '',
      event.pageUrl || '',
      params,
      value
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `events_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export to JSON
 */
function exportToJSON() {
  const data = filteredEvents.map(event => ({
    id: event.id,
    eventName: event.eventName,
    timestamp: event.timestamp instanceof Date 
      ? event.timestamp.toISOString() 
      : new Date(event.timestamp).toISOString(),
    userId: event.userId,
    sessionId: event.sessionId,
    pageUrl: event.pageUrl,
    params: event.params || {},
    userAgent: event.userAgent
  }));

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `events_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Close modal on overlay click
  const modal = document.getElementById('event-detail-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeEventDetailModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeEventDetailModal();
    }
  });
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
 * Utility: Show alert
 */
function showAlert(message, type = 'info') {
  // Simple alert - can be enhanced with a toast notification system
  alert(message);
}

// Make functions globally available
window.viewEventDetails = viewEventDetails;
window.closeEventDetailModal = closeEventDetailModal;
window.switchTab = switchTab;
window.loadFunnelData = loadFunnelData;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.changePage = changePage;
window.exportEvents = exportEvents;






