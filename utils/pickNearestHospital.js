async function pickNearestHospital(location) {
  location = location.toLowerCase();
  const { DATA_API_KEY } = process.env;

  const fetchRes = await fetch(`https://api.data.gov.in/resource/37670b6f-c236-49a7-8cd7-cc2dc610e32d?api-key=${DATA_API_KEY}&format=json`);

  const res = await fetchRes.json();

  const hospitals = res.records;

  const nearBy = hospitals.filter((hospital) => {
    (hospital.state && hospital.state.trim().toLowerCase().includes(location)) ||
    (hospital._location && hospital._location.trim().toLowerCase().includes(location))
  });

  console.log(nearBy);
  if(!nearBy.length) {
    console.log(hospitals);
  }
}

export default pickNearestHospital;