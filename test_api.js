
async function checkAPI() {
    try {
        console.log("Fetching Regions...");
        const respRegions = await fetch('https://psgc.cloud/api/regions');
        const regions = await respRegions.json();
        console.log("First Region:", regions[0]);

        // Find NCR
        const ncrRegion = regions.find(r => r.name === 'National Capital Region' || r.code === '1300000000');
        console.log("NCR Region:", ncrRegion);

        if (ncrRegion) {
            console.log(`\nFetching Cities for NCR (Region Code: ${ncrRegion.code})...`);
            // Endpoint usually is /regions/:code/cities-municipalities, assuming code is the '130000000' or similar. 
            // PSGC API usually accepts the code as is.
            const respNcrCities = await fetch(`https://psgc.cloud/api/regions/${ncrRegion.code}/cities-municipalities`);

            if (respNcrCities.ok) {
                const ncrCities = await respNcrCities.json();
                console.log(`Found ${ncrCities.length} cities in NCR.`);
                console.log("First 3:", ncrCities.slice(0, 3));
            } else {
                console.log("Could not fetch NCR cities via region endpoint. Status:", respNcrCities.status);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

checkAPI();
