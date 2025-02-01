console.log('IT’S ALIVE!');

function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
}   

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// currentLink?.classList.add("current");


let pages = [ 
    { url: 'index.html', title: 'Home' }, 
    { url: 'contact/index.html', title: 'Contact' }, 
    { url: 'resume/index.html', title: 'Resume' }, 
    { url: 'projects/index.html', title: 'Projects' }, 
    { url: 'https://www.linkedin.com/in/derricknguyen12/', title: 'LinkedIn' }, 
    { url: 'https://github.com/derricknguyen12', title: 'GitHub' } 
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    if (!url.startsWith('http')) {
        url = ARE_WE_HOME ? url : `/${url}`;
        url = `/portfolio${url}`;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    let linkPath = new URL(a.href, location.origin).pathname;
    let currentPath = location.pathname;

    if (!linkPath.endsWith('/')) linkPath += '/';
    if (!currentPath.endsWith('/')) currentPath += '/';

    if (a.host !== location.host) {
        a.target = '_blank';
    } else {
        a.classList.toggle(
            'current', 
            location.host === a.host && linkPath === currentPath
        );
    }

    nav.appendChild(a);
}


document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="theme-switcher">
              <option value="automatic">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>
    `
);

function updateTheme(theme) {
    const root = document.documentElement;

    if (theme === 'automatic') {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.style.colorScheme = prefersDark ? 'dark' : 'light';
        root.classList.toggle('dark', prefersDark);
    } else {
        root.style.colorScheme = theme;
        root.classList.toggle('dark', theme === 'dark');
    }
}

const themeSwitcher = document.getElementById('theme-switcher');

const savedTheme = localStorage.getItem('preferred-theme') || 'automatic';
themeSwitcher.value = savedTheme;
updateTheme(savedTheme);

themeSwitcher.addEventListener('change', (event) => {
    const selectedTheme = event.target.value;
    updateTheme(selectedTheme);

    localStorage.setItem('preferred-theme', selectedTheme);
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', () => {
    const currentTheme = localStorage.getItem('preferred-theme') || 'automatic';
    if (currentTheme === 'automatic') {
        updateTheme('automatic');
    }
});


export async function fetchJSON(url) {
    try {
        console.log(`Fetching JSON from: ${url}`);
        const response = await fetch(url);
        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched projects:", data);
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON:', error);
        return null;
    }
}

window.fetchJSON = fetchJSON;

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement || !(containerElement instanceof HTMLElement)) {
        console.error("Invalid container element provided.");
        return;
    }

    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadings.includes(headingLevel)) {
        console.warn(`Invalid heading level "${headingLevel}". Defaulting to "h2".`);
        headingLevel = 'h2';
    }

    const titleElement = document.querySelector('.projects-title');
    if (titleElement) {
        titleElement.textContent = `${projects.length} Projects`;
    }

    containerElement.innerHTML = '';

    projects.forEach(project => {
        const article = document.createElement('article');

        const heading = document.createElement(headingLevel);
        heading.textContent = project.title || 'Untitled Project';

        const img = document.createElement('img');
        img.src = project.image?.trim() || 'default-placeholder.png';
        img.alt = project.title?.trim() || 'Project image';
        img.loading = 'lazy';

        const description = document.createElement('p');
        description.textContent = project.description?.trim() || 'No description available.';

        article.appendChild(heading);
        article.appendChild(img);
        article.appendChild(description);

        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}






