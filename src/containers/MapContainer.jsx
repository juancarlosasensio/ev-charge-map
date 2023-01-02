import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { evChargers as seedData } from '../utils/globalConstants';
import { formattedPhone } from '../utils/functions';
import Map from '../components/Map';
import MapSidebar from '../components/MapSidebar';
import EmptyMapContainer from './EmptyMapContainer';

const MapContainer = () => {
  // Many of the app's features rely on this ref in order to work properly...
  const mapRef = useRef();

  // Lat, long default values to initialize map center + initializing evChargersData
  const [latitude, setLatitude] = useState(44.4914);
  const [longitude, setLongitude] = useState(73.1857);
  const [locationFallback, setLocationFallback] = useState('');
  const [evChargersData, setEvChargersData ] = useState(seedData);

  // Attempt to get user's location with native browser navigation API
  useEffect(() => {
    let shouldLocateUser = true;
    getLocation();

    return () => shouldLocateUser = false;
  })

  // Fetch data from DoE and set state...
  useEffect(() => {
    let shouldFetchData = true;

    const fetchEvData = async () => {
      const res = await fetch(
        `/api/ev-data/lat/${latitude}/lng/${longitude}`, { 
          headers: {
            'Authorization': `${process.env.REACT_APP_AUTH_HEADER}` 
      }});
      const data = await res.json();

      console.log(data);
      
      if (data?.features?.length > 0 && shouldFetchData ) {
        console.log('DoE data received and set successfully.');
        setEvChargersData(data)
      }
    }

    try {
      fetchEvData()
    } catch (error) {
      console.error(error)
    }

    // Cleanup function...cancel any future data fetching and setting
    return () => shouldFetchData = false;
  }, [latitude, longitude]);


  // Set state with fallback location data, which is less precise...
  useEffect(() => {
    let shouldUseLocationFallback = true;
    if (locationFallback && shouldUseLocationFallback) {
      fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json')
        .then(res => res.json())
        .then(data => {
          const dataEntry = data[`K${locationFallback}`];
          setLongitude(dataEntry.lon);
          setLatitude(dataEntry.lat);
        });
    }

    return () => shouldUseLocationFallback = false;
  }, [locationFallback]);

   /*
    Util funcs to handle getting user's location with the browser's native navigator API 
  */
    function onGetLocationSuccess(position) {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    }
  
    function onGetLocationError() {
      console.log('Geolocation error!');
      getCloudflareJSON()
          .then((entry) => setLocationFallback(entry.colo));
    }
  
    function getLocation() {
      if (!navigator.geolocation) {
        console.log('Geolocation API not supported by this browser.');
        getCloudflareJSON()
          .then((entry) => setLocationFallback(entry.colo));
  
      } else {
        console.log('Checking location...');
        navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError);
      }
    }

       /* 
       Fallback to getting location from Cloudflare if native navigator API is not available: 
        (1) is not available (user agent settings) or 
        (2) it fails for some reason 
       *output*: JS Object (fetch returns plain text, which is then parsed to js object) or 'undefined'
    */ 
       async function getCloudflareJSON(){
        try {
          // Initialize controller because Cloudflare endpoint errors silently and remains "stalled" for a while instead of erroring...
          let controller = new AbortController();
          setTimeout(() => controller.abort(), 2000);
    
          // Pass controller's signal to abort after 2 seconds...
          let res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
            signal: controller.signal
          }
          );
          let data = await res.text();
          let arr = data.trim().split('\n').map(e=>e.split('='))
          return Object.fromEntries(arr)
          } catch(error) {
            console.log(error);
    
            /*
              If call to Cloudflar fails, 
              set fallback states to 'seedData' 
              and (1) prevent app from crashing; (2) display something meaningful to people
            */
            setLocationFallback('');
            setLatitude(seedData.metadata.latitude);
            setLongitude(seedData.metadata.longitude);
            setEvChargersData(seedData);
          }
        }

  /* 
    Util funcs that rely on MapboxGL methods and this React app's mapRef in order to work...
  */
  const flyToStore = (currentFeature) => {
    mapRef.current.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15
    });
  }
  
  const createPopUp = (station) => {
    const popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
    const popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(station.geometry.coordinates)
      .setHTML(
        `<h3>${station.properties.station_name}</h3>
         <h4><strong>${station.properties.street_address}</strong></h4>
         <h4>${formattedPhone(station.properties.station_phone)}</h4>
        `)
      .addTo(mapRef.current);
    }
  
    // Determine what should be rendered with this "sentinel" variable...
  const isMapDataReady = evChargersData;

  return (
    <>
     {isMapDataReady
        ? <>
            <MapSidebar 
            flyToStore={flyToStore} 
            createPopUp={createPopUp} 
            evChargersData={evChargersData} 
            />
            <Map 
              flyToStore={flyToStore} 
              createPopUp={createPopUp} 
              evChargersData={evChargersData} 
              mapRef={mapRef} 
              centerLat={latitude} 
              centerLong={longitude} 
            />
          </>
        : <EmptyMapContainer />
      }
    </>
  )
}

export default MapContainer;