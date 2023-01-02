const { Router } = require('express');
const { 
  getEVData 
} = require('./handlers/evData');

const router = Router();
router.get('/ev-data/lat/:lat/lng/:lng', getEVData)

module.exports = router;