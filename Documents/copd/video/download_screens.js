const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'assets', 'screens');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const urls = [
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLuf-OjymbkD-2NTlhr3sEpjZPATaEAxb-U02Xg0njSvidNgYuA4RUTf_E45SGdRLDyClRv-4gB3R2yvMUGi2Dxel_NKdB6KZ-2XS5NY8NN7s38CmBA8r6TRUQLcjcFjtd31drygblJR5SX8hHIHhHz4Lyln4PY4TMOqL0uvBf20GcXvuaJL-YBuh6TEmxTKmRd-c5OYT9iwBJFB_NVBTb4UOKg0QVy5VFSzpnK3xf2M6A5pjmTaYXjmsLI",
    dest: path.join(dir, 'welcome_login.png')
  },
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLs0fGx89XXxwvlLOP6g55oZpub-xnMlFa8NC5xFuc7NGehKGCDfplhyGWkptAGKqp8j6aceTDiZhkxxAz6oLCB-GsIrBJ_Q-71-1ukUDx4IVyRKUOfh3XIzSqJVtrOKDZT83WpluLKrjn7FFmQnJu-gR0m7_H2docXTUJ-Ktk148wNJlXf2jFnUGSR9zA5Hf9qIOOVSaYpIIknlbAabzuG1ylCFkuq5mTU_FmyusGSAIT6WZtWm38Wochs",
    dest: path.join(dir, 'home_navigation.png')
  },
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLtsu2DkGYrKSszfzMqhOqDzm0yGcbtza_aE_NwOxzWA_yK8_8mXMloWDOLQEj4-U93Ie7OwDYYPzYYjzd8DLW2xhfMkLDDvMKkwq7_w3RRTFu91lrPEanWeVbVtmiUYLAHXqzc8Z7c-rWpy-saWj6RBmm0Ac5svFOCtI4Evg0aHGOwNH7TPpbsw3nvZ6SSqAJcwQhxumDD9CwYNyNFPwviONIdbZHizrfpXnZ3F9F7jowcvJLFxjFOM8A",
    dest: path.join(dir, 'functional_prototype.png')
  },
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLsRb_ciQzhiwGfAk2r5pGGNlk1KwpCZstGQBrPJhh9giWH4Z2gvIJbm7MG67EFAooyOeWer8qCY5b5k7xHuZOgTsfWf8EX6q2FpHXYPCqsP0bRQiPAwK5yNwRHG3uCsJMn3aj38xJmIQPLG6AKw-5Xdyi7Qk3UiaVOceBm61eyphp6Yie1Y5_CU9NDv0t1ZV0C0HcJLGcNpuxof0Csr6NiRl-IsrbU-Xp8dNdMfHuPH-O3oOoC6Q1QFBN8",
    dest: path.join(dir, 'my_prototype.png')
  },
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLvC3vSo7LPQCL4U7cSjZYlY2Cvdus08TFcHnISAQ4G6qCtAwXj4z59IS-MmH3UzF_pc76OunnMWoF5WjJK6WjF5wfO1byE52Flmk7c58xkteqkRCePcsnOVV0Rp3YYXe2VL3HucrdNNdJ5CyetZT9wr5LLo70CXLsgeA7s0Xh00ny2Q2yxhGuZoe42CoGz2V8LgPkQIEg5OxJVuvCirg46LV_73-pvnc6GUKs9s9yW_jk85JRArXNEvxA",
    dest: path.join(dir, 'action_plan.png')
  },
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLsDPYG4X1a13lMWh-Cv9NiMElDxM7EtxbcXhUS4z4LPooVSSvLhbC6GF_LSR_x7QjsKxWizK7zBA-fZbaYkoKjPgcJO0-dVTKS1UoSi3GRqy_ByiNS1EDHjimUUhHsupFHFp2mlQLv6exlxRdZH1FUsm2bIiihrJmHsJJyEArc8hBR5WKqoLtYGY0Xw59MJie0kZHQ_OTVZrqzMAJW1q9z0tg7J5blrRp7e6T9CnYfrTGNYsfmOg4HiJA",
    dest: path.join(dir, 'visual_analytics.png')
  },
  {
    url: "https://lh3.googleusercontent.com/aida/AP1WRLte5jKNF6quTGBz-jsamRn0giJ1ScWuBcQ5B8e41scOs4MQgrd6blp3-aiyHlGoOihTbfd5xKd5pLLLQxyH9j4Qi8RGDO_BYlTL9rLSuWUIQzoAbM94XPixd7X6X6IzXWoBbMv6MZKZ3t-5JkRek3wBHzEouesFsBEbSzN4O-XNAhNAAhS2Ls-I-_rY0eqsADt-t-vjPAtuEVAqAIlB6a5gWJ0KIMCqKSQjE7OQjflqmXOPUhd6l9z8KoY",
    dest: path.join(dir, 'historical_log.png')
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  try {
    for (const item of urls) {
      await download(item.url, item.dest);
    }
    console.log('All downloads completed!');
  } catch (err) {
    console.error('Error downloading:', err);
    process.exit(1);
  }
}

main();
