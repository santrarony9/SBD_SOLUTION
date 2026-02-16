
async function checkHeroText() {
    const url = 'https://api.sparkbluediamond.com/api/store/settings/homepage_hero_text';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            try {
                const text = await response.text();
                console.error('Body:', text);
            } catch (e) { }
            return;
        }
        const data = await response.json();
        console.log('Raw Data:', JSON.stringify(data, null, 2));

        if (data && data.value) {
            console.log('Value type:', typeof data.value);
            try {
                if (typeof data.value === 'string') {
                    const parsed = JSON.parse(data.value);
                    console.log('Parsed Value:', parsed);
                    console.log('Parsed type:', typeof parsed);
                } else {
                    console.log('Value is ALREADY parsed (object):', data.value);
                }
            } catch (e) {
                console.error('JSON.parse(data.value) failed:', e.message);
            }
        } else {
            console.log('Data or data.value is null/undefined');
        }
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

checkHeroText();
