/**
 * Admin Navigation Collapse/Expand Functionality
 * Makes navigation sections collapsible and collapses all by default
 */

document.addEventListener('DOMContentLoaded', () => {
  initCollapsibleNavigation();
});

/**
 * Initialize collapsible navigation sections
 */
function initCollapsibleNavigation() {
  const nav = document.querySelector('.admin-nav');
  if (!nav) return;

  const sections = nav.querySelectorAll('.admin-nav-section');
  
  sections.forEach((section) => {
    // Make section header clickable
    section.style.cursor = 'pointer';
    section.style.userSelect = 'none';
    
    // Add chevron icon
    const chevron = document.createElement('i');
    chevron.className = 'fas fa-chevron-down nav-section-chevron';
    chevron.style.marginRight = '8px';
    chevron.style.transition = 'transform 0.3s ease';
    chevron.style.display = 'inline-block';
    chevron.style.width = '12px';
    chevron.style.textAlign = 'center';
    // Insert chevron at the beginning
    if (section.firstChild) {
      section.insertBefore(chevron, section.firstChild);
    } else {
      section.appendChild(chevron);
    }
    
    // Find all items after this section until next section or divider
    const sectionItems = [];
    let nextSibling = section.nextElementSibling;
    
    while (nextSibling && 
           !nextSibling.classList.contains('admin-nav-section') && 
           !nextSibling.classList.contains('admin-nav-divider')) {
      if (nextSibling.classList.contains('admin-nav-item')) {
        sectionItems.push(nextSibling);
      }
      nextSibling = nextSibling.nextElementSibling;
    }
    
    // Wrap items in a container
    if (sectionItems.length > 0) {
      const container = document.createElement('ul');
      container.className = 'admin-nav-submenu';
      container.style.display = 'none'; // Collapsed by default
      
      // Insert container after section
      section.parentNode.insertBefore(container, section.nextSibling);
      
      // Move items into container
      sectionItems.forEach(item => {
        container.appendChild(item);
      });
      
      // Set initial state (collapsed)
      section.setAttribute('data-collapsed', 'true');
      chevron.style.transform = 'rotate(-90deg)';
    }
    
    // Add click handler
    section.addEventListener('click', () => {
      toggleSection(section);
    });
  });
}

/**
 * Toggle a navigation section
 * @param {HTMLElement} section - The section header element
 */
function toggleSection(section) {
  const submenu = section.nextElementSibling;
  if (!submenu || !submenu.classList.contains('admin-nav-submenu')) return;
  
  const chevron = section.querySelector('.nav-section-chevron');
  const isCollapsed = section.getAttribute('data-collapsed') === 'true';
  
  if (isCollapsed) {
    // Expand
    submenu.style.display = 'block';
    section.setAttribute('data-collapsed', 'false');
    if (chevron) {
      chevron.style.transform = 'rotate(0deg)';
    }
  } else {
    // Collapse
    submenu.style.display = 'none';
    section.setAttribute('data-collapsed', 'true');
    if (chevron) {
      chevron.style.transform = 'rotate(-90deg)';
    }
  }
}

