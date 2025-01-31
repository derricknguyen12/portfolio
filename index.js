import { fetchJSON, renderProjects } from './global.js';

async function loadLatestProjects() {
    try {
        const projects = await fetchJSON('./lib/projects.json');
        const latestProjects = projects.slice(0, 3);

        const projectsContainer = document.querySelector('.projects');

        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
        } else {
            console.error("Projects container not found.");
        }
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

loadLatestProjects();
