import React from 'react';
import { formattedPhone } from "../utils/functions";
const MapSidebar = ({ flyToStore, createPopUp, evChargersData }) => {
      const handleListItemClick = (e) => {
        for (const feature of evChargersData.features) {
            if (e.target.id === `${feature.properties.id}`) {
              flyToStore(feature);
              createPopUp(feature);
            }
        }
        const activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
            activeItem[0].classList.remove('active');
        }
        e.target.parentNode.classList.add('active');
     }

    return (
        <div className='sidebar'>
            <div className='heading'>
                <h1>EV Chargers near you</h1>
            </div>
            <div id='listings' className='listings'>
                {evChargersData.features.map((station, index) => (
                    <div className="item" id={`listing-${station.properties.id}`}>
                        <a
                            href='#' 
                            className='title' 
                            id={station.properties.id}
                            onClick={handleListItemClick}>
                            {station.properties.street_address}
                        </a>
                        {station.properties.city}, {station.properties.state} - {formattedPhone(station.properties.station_phone)}
                    </div>
                ))}
            </div>
        </div>
    )
  }
  
  export default MapSidebar;