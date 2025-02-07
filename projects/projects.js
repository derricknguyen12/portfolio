import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join(' ').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');

  renderPieChart(filteredProjects);
});


let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcData.forEach((d, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(idx))
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('class', 'legend-item')
          .attr('style', `--color:${colors(idx)}`)
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});

function renderPieChart(projectsGiven) {
    let svg = d3.select('svg');
    svg.selectAll('*').remove();
    
    let legend = d3.select('.legend');
    legend.selectAll('*').remove();
  
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
  
    let newData = newRolledData.map(([year, count]) => ({
      value: count,
      label: year,
    }));
  
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let arcs = arcData.map((d) => arcGenerator(d));
  
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
    arcs.forEach((arc, idx) => {
      svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
    });
  
    newData.forEach((d, idx) => {
      legend.append('li')
        .attr('class', 'legend-item')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
  }
  
renderPieChart(projects);
  