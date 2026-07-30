// admin.js

import { load_side_nav } from "./sidenav.js";

load_side_nav();

function initSideNav() {
  const navItems = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".panel");

  const hideAllPanels = () => panels.forEach(p => p.classList.remove("active"));

  navItems.forEach(item => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove("active"));
      this.classList.add("active");

      hideAllPanels();
      const targetPanel = document.getElementById(`panel-${this.dataset.panel}`);
      if (targetPanel) targetPanel.classList.add("active");

      const titleEl = document.getElementById("topbar-title");
      const textEl = this.querySelector(".nav-text");
      if (titleEl && textEl) titleEl.textContent = textEl.textContent;
    });
  });

  const firstNav = document.querySelector(".nav-item[data-panel]");
  if (firstNav) firstNav.click();
}

function initNavButtons() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", function () {
      const navItem = document.querySelector(`.nav-item[data-panel="${this.dataset.nav}"]`);
      if (navItem) navItem.click();
    });
  });
}

function initFilters() {
  document.querySelectorAll(".filter-bar .filter-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const parent = this.closest(".filter-bar");
      if (parent) {
        parent.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
      }

      const panel = this.closest(".panel");
      if (!panel) return;

      const filterText = this.textContent.trim().toLowerCase();
      const table = panel.querySelector(".data-table tbody");
      if (table) {
        table.querySelectorAll("tr").forEach(row => {
          const rowText = row.textContent.toLowerCase();
          row.style.display = filterText === "all" || rowText.includes(filterText) ? "" : "none";
        });
      }

      panel.querySelectorAll(".verif-card").forEach(card => {
        const status = card.dataset.status || "";
        if (filterText === "all") {
          card.style.display = "";
        } else {
          card.style.display = status.includes(filterText) ? "" : "none";
        }
      });
    });
  });
}

function initSearch() {
  document.querySelectorAll(".search-wrap .search-input").forEach(input => {
    input.addEventListener("keyup", function () {
      const searchText = this.value.toLowerCase().trim();
      const panel = this.closest(".panel");
      if (!panel) return;

      const table = panel.querySelector(".data-table tbody");
      if (table) {
        table.querySelectorAll("tr").forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(searchText) ? "" : "none";
        });
      }

      panel.querySelectorAll(".report-card, .review-mod-card, .verif-card").forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(searchText) ? "" : "none";
      });
    });
  });
}

function initUserTabs() {
  document.querySelectorAll(".user-tab").forEach(tab => {
    tab.addEventListener("click", function () {
      const parent = this.closest(".user-tabs");
      if (!parent) return;

      parent.querySelectorAll(".user-tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      const filter = this.dataset.filter;
      const panel = this.closest(".panel");
      const table = panel?.querySelector(".data-table tbody");
      if (!table) return;

      table.querySelectorAll("tr").forEach(row => {
        const role = row.dataset.role;
        const status = row.dataset.status;
        let show = true;
        if (filter === "tenant") show = role === "tenant";
        else if (filter === "owner") show = role === "owner";
        else if (filter === "suspended") show = status === "suspended";
        row.style.display = show ? "" : "none";
      });
    });
  });
}

function initAudienceChips() {
  document.querySelectorAll(".audience-grid .audience-chip").forEach(chip => {
    chip.addEventListener("click", function () {
      const parent = this.closest(".audience-grid");
      if (parent) {
        parent.querySelectorAll(".audience-chip").forEach(c => c.classList.remove("selected"));
        this.classList.add("selected");
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      }
    });
  });
}

function initMessages() {
  const msgs = document.querySelector(".fixed.top-4");
  if (msgs) {
    setTimeout(() => msgs.remove(), 4000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSideNav();
  initNavButtons();
  initFilters();
  initSearch();
  initUserTabs();
  initAudienceChips();
  initMessages();
  initMobileSidebar();
});

// Mobile Sidebar Initialization
function initMobileSidebar() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');

  if (!menuBtn || !sidebar) return;

  menuBtn.addEventListener('click', function () {
    sidebar.classList.toggle('hidden');

    setTimeout(() => {
      sidebar.classList.toggle('hidden');
    }, 5000);

  });

  document.addEventListener('click', function (e) {
    if (!sidebar.classList.contains('hidden') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.add('hidden');
    }
  });
}
