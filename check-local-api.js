
async function checkLocalHeroText() {
    const url = 'http://localhost:3001/api/store/settings/homepage_hero_text';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            return;
        }
        const data = await response.json();
        console.log('Raw Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

checkLocalHeroText();
