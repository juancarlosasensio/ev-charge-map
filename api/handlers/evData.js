const fetch = require('node-fetch');
const processErrorResponse = require('../utils/processErrorResponse');

const getEVData = async (req, res) => {
  const {lat, lng} = req.params;
  const protocol = 'https://';
  const host = 'developer.nrel.gov';
  const apiParams = `/api/alt-fuel-stations/v1/nearest.geojson?api_key=${process.env.DOE_API_KEY}&longitude=${lat}&latitude=${lng}&fuel_type=ELEC`
  try { 
    const URL = `${protocol}${host}${apiParams}`
    const response = await fetch(URL, {
      host: host,
      port: process.env.PORT || 8081,
      path: apiParams,
      method : 'GET'
    });
    const data = await response.json(); 

    if (data) {
      console.log(`Got DOE data for lat: ${lat}, lng: ${lng}`)
    }
    
    res.status(200).json(data);

  } catch (err) {
    let errMessage = `${err}`;
    processErrorResponse(res, 500, errMessage); 
  }
}

module.exports = {
  getEVData
}