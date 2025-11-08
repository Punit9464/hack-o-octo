async function pickNearestHospital(location) {
  location = location.toLowerCase();
  const { DATA_API_KEY } = process.env;

  const fetchRes = await fetch(`https://api.data.gov.in/resource/37670b6f-c236-49a7-8cd7-cc2dc610e32d?api-key=${DATA_API_KEY}&format=json`);

  const res = await fetchRes.json();

  // lets fnd

  const hospitals = res.records;
}

