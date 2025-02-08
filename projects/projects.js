import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let searchInput = document.querySelector('.searchBar');
let selectedIndex = -1;

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
  
    newData.forEach((d, idx) => {
      legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });

    arcs.forEach((arc, i) => {
      svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .attr('class', i === selectedIndex ? 'selected' : '')
        .style('cursor', 'pointer')
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
    
          svg.selectAll('path')
            .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
    
          d3.selectAll('li')
            .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
    
          if (selectedIndex === -1) {
            renderProjects(projectsGiven, projectsContainer, 'h2');
          } else {
            let selectedYear = newData[selectedIndex].label;
            let filteredProjects = projectsGiven.filter(project => project.year === selectedYear);
    
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
    
          renderPieChart(filteredProjects);
        });
    });
  }
  
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  let query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});


  