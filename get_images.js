const https = require('https');
https.get('https://lvlup.tivaosagencytempdomains.de/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/<div class="lvf-container lvf-s02-partners">([\s\S]*?)<\/div>/);
    if(match) console.log(match[1]);
  });
});
