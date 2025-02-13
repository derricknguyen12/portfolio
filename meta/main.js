let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('../meta/loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
    
    console.log(data);
    processCommits();
    console.log(commits);
}

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
                configurable: false,
                writable: false,
                enumerable: false,
            });
            
            return ret;
        });
}

function displayStats() {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

=  const numberOfFiles = d3.group(data, d => d.file).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numberOfFiles);

  const maxFileLength = d3.max(data, d => d.line);
  dl.append('dt').text('Maximum file length (lines)');
  dl.append('dd').text(maxFileLength);

  const averageFileLength = d3.mean(data, d => d.line);
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(averageFileLength.toFixed(2));

  const longestLineLength = d3.max(data, d => d.length);
  dl.append('dt').text('Longest line length (characters)');
  dl.append('dd').text(longestLineLength);

  const workByPeriod = d3.rollups(
    data,
    v => v.length,
    d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
  dl.append('dt').text('Time of day most work is done');
  dl.append('dd').text(maxPeriod);

  const workByDay = d3.rollups(
    data,
    v => v.length,
    d => new Date(d.datetime).toLocaleString('en', { weekday: 'long' })
  );
  const maxDay = d3.greatest(workByDay, d => d[1])?.[0];
  dl.append('dt').text('Day of the week most work is done');
  dl.append('dd').text(maxDay);
}

