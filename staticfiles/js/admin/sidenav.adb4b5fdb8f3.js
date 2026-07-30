// sidenav.js

import { side_nav } from "./data.js";

const side_nav_bar = document.querySelector("#side-nav-bar");

export function load_side_nav() {
    const nav_html = side_nav.map(section => `
        <div class="nav-section w-full">
            <div class="nav-label">${section.section}</div>
            ${section.panel.map(item => `
                <button class="nav-item w-full" data-panel="${item.text.toLowerCase()}">
                    <div class="nav-icon"><i class="${item.icons}"></i></div>
                    <div class="nav-text">${item.text}</div>
                </button>
            `).join('')}
        </div>
    `).join('');

    side_nav_bar.innerHTML = nav_html;
}
