let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    displayStats()
    createScatterplot() 

}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

//console.log(commits)

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

  
        let ret = {
            id: commit,
            url: 'https://github.com/YOUR_REPO/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            enumerable: false,
            configurable: false,
            writable: false
        });

        return ret;
      });
}

function displayStats() {
    processCommits();
  
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').text('commits');
    dl.append('dd').text(commits.length);

    dl.append('dt').text('Files');
    dl.append('dd').text(new Set(data.map(d => d.file)).size);
  
    dl.append('dt').text('total loc');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Max depth');
    dl.append('dd').text(d3.max(data, d => d.depth));

    dl.append('dt').text('Longest line');
    dl.append('dd').text(d3.max(data, d => d.length === d3.max(data, d => d.length) ? d : null).line);

    dl.append('dt').text('Max lines');
    dl.append('dd').text(d3.max(data, d => d.length));
}