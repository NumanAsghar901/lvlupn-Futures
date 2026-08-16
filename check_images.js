const https = require('https');
const urls = [
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-6092c95f3d.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-aaa0702b84.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-68d37717bf.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-a475a4c22a.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-3c2a250380.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-1d873c473e.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-aecc93c76f.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-1168017751.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-01f64d2541.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-ece298d0ec.webp',
'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-hand-soll.webp'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => console.log(url + ' - ' + size + ' bytes'));
  });
});
