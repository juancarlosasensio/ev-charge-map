import React from 'react';

const EmptyMapContainer = () => {
    const divStyles = {
      maxWidth: '100%', 
      height: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }
    return (
      <div style={divStyles}>
        <h2>Loading map...</h2>
      </div>
    )
  };

  export default EmptyMapContainer;