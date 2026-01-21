
const fs = require('fs');
const path = require('path');

try {
    const dataPath = path.join(process.cwd(), 'src/data/militarybases.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const bases = JSON.parse(rawData);

    console.log(`Loaded ${bases.length} bases.`);

    function normalizeDomain(domain = '') {
        const d = domain.toLowerCase();
        if (d.includes('/') || d.includes(',') || d === 'hybrid') return 'joint';
        if (d.includes('land')) return 'land';
        if (d.includes('air')) return 'air';
        if (d.includes('sea')) return 'sea';
        if (d.includes('space')) return 'space';
        return 'joint';
    }

    const counts = {};
    const domains = new Set();

    bases.forEach((base, index) => {
        if (!base.domain) {
            console.warn(`Base at index ${index} (${base.facility_name}) has no domain.`);
        }

        domains.add(base.domain);
        const icon = normalizeDomain(base.domain);
        counts[icon] = (counts[icon] || 0) + 1;
    });

    console.log('Icon distribution:', counts);
    console.log('Unique raw domains:', Array.from(domains));
    console.log('Validation successful.');

} catch (e) {
    console.error('Validation failed:', e);
}
