import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import '../App.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const Map = ({mapRef, flyToStore, createPopUp, evChargersData, centerLat, centerLong}) => {
  const mapContainerRef = useRef(null);
  
  const [lng, setLng] = useState(centerLat);
  const [lat, setLat] = useState(centerLong);
  const [zoom, setZoom] = useState(2.5);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [centerLong, centerLat],
      zoom: 12,
      scrollZoom: false
  });

    mapRef.current = map;

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      /* Add the data to  map as a source */
      map.addSource('stations', {
        type: 'geojson',
        data: evChargersData
      })

      /* Add markers on the map */
      addMarkers()
    });

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // TODO: refactor this func to more "idiomatic" React...how?
    function addMarkers() {
      /* For each feature in the evChargersData GeoJSON object: */
      for (const marker of evChargersData.features) {
        /* Create a div element for the marker. */
        const el = document.createElement('div');
        /* Assign a unique `id` to the marker. */
        el.id = `marker-${marker.properties.id}`;
        /* Assign the `marker` class to each marker for styling. */
        el.className = 'marker';
    
        /**
         * Create a marker using the div element
         * defined above and add it to the map.
         **/
        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);

          el.addEventListener('click', (e) => {
            /* Fly to the point */
            flyToStore(marker);
            /* Close all other popups and display popup for clicked store */
            createPopUp(marker);
            /* Highlight listing in sidebar */
            const activeItem = document.getElementsByClassName('active');
            e.stopPropagation();
            if (activeItem[0]) {
              activeItem[0].classList.remove('active');
            }
            const listing = document.getElementById(`listing-${marker.properties.id}`);
            listing.classList.add('active');
          });  
      }
    }

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
      <div className='map' id="map" ref={mapContainerRef} />
  );
};

export default Map;