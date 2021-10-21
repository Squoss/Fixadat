// https://developer.here.com/documentation/map-image/dev_guide/topics/resource-map.html
// https://developer.here.com/documentation/maps/3.1.25.0/dev_guide/topics/react-practices.html
// see also https://developer.here.com/tutorials/react/

import React from 'react';

export default class MapDisplayClass extends React.Component {

  render() {
    const apiKey = document.querySelector("meta[name='here-api-key']").getAttribute("content");
    const zoomLevel = 16;

    return this.props.value === undefined ? <div /> :
      <React.Fragment>
        <a href={`https://wego.here.com/?map=${this.props.value.latitude},${this.props.value.longitude},${zoomLevel}`} target="HEREWeGo">
          <img alt={`a map${this.props.value.name ? ` of ${this.props.value.name}` : ""}`} src={`https://image.maps.ls.hereapi.com/mia/1.6/mapview?apiKey=${apiKey}&c=${this.props.value.latitude},${this.props.value.longitude}&h=540&w=960&z=${zoomLevel}`} />
        </a>
      </React.Fragment>
  }
}
