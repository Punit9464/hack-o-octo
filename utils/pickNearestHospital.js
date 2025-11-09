const fetchHospital = async(location) => {
  const { area, city, district, state, region } = location;
  const locationStr = [area, city, district, state, region]
    .filter(term => term)
    .join(', ');
  
  console.log('Searching for:', locationStr);
  
  try {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`;
    
    const geocodeRes = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'HospitalFinderApp/1.0'
      }
    });
    const geocodeData = await geocodeRes.json();
    
    console.log('Geocode results:', geocodeData);
    
    if (geocodeData.length === 0) {
      const fallbackStr = [city, state].filter(term => term).join(', ');
      console.log('Trying fallback:', fallbackStr);
      
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackStr)}&format=json&limit=1`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'HospitalFinderApp/1.0'
        }
      });
      const fallbackData = await fallbackRes.json();
      
      if (fallbackData.length === 0) {
        throw new Error(`Location not found: "${locationStr}". Please check the spelling or try a different location.`);
      }
      
      geocodeData.push(fallbackData[0]);
    }
    
    const { lat, lon } = geocodeData[0];
    console.log('Coordinates found:', lat, lon);
    
    const radius = 5000;
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        relation["amenity"="hospital"](around:${radius},${lat},${lon});
      );
      out center;
    `;
    
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const hospitalRes = await fetch(overpassUrl);
    const hospitalData = await hospitalRes.json();
    
    console.log('Hospitals found:', hospitalData.elements.length);
    
    const hospitals = hospitalData.elements.map(hospital => ({
      name: hospital.tags?.name || 'Unnamed Hospital',
      address: hospital.tags?.['addr:street'] || '',
      city: hospital.tags?.['addr:city'] || '',
      phone: hospital.tags?.phone || '',
      lat: hospital.lat || hospital.center?.lat,
      lon: hospital.lon || hospital.center?.lon,
      emergency: hospital.tags?.emergency === 'yes'
    }));
    
    const hs = hospitals.length ? hospitals[0] : null;
    if(!hs) {
      const file = await import("../hospitals.json", { assert: { type: "json" }});
      const hss = file.filter((h) => {
        (h.pincode && h.pincode === location.pincode) || 
        (h.city && h.city.includes("Chandigarh"))
        || (h.city && h.city.includes("Mohali"))
      });

      return hss[0];                                    
    }

    return hs;
    
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return null;
  }
};

export default fetchHospital;