// https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics-api/code-autosuggest-examples.html
// https://developer.here.com/documentation/maps/3.1.25.0/dev_guide/topics/react-practices.html
// see also https://developer.here.com/tutorials/react/

import React from 'react';
import H from "@here/maps-api-for-javascript";
import AsyncSelect from 'react-select/async';

const toHere = (fromGeo) => { return fromGeo === undefined ? undefined : { title: fromGeo.name === undefined ? undefined : fromGeo.name, position: { lng: fromGeo.longitude, lat: fromGeo.latitude } }; };

const toSelect = (fromHere) => { return fromHere === undefined ? undefined : { value: fromHere.position, label: fromHere.title }; };

const toGeo = (fromSelect) => { return fromSelect === undefined ? undefined : { name: fromSelect.label, longitude: fromSelect.value.lng, latitude: fromSelect.value.lat }; };

export default class MapSearchClass extends React.Component {

  state = {
    service: null,
    inputValue: this.props.value === undefined || this.props.value.name === undefined ? '' : this.props.value.name
  };


  componentDidMount() {
    const platform = new H.service.Platform({
      apikey: document.querySelector("meta[name='here-api-key']").getAttribute("content")
    });

    const service = platform.getSearchService();
    this.setState({ service });
  }

  handleOnInputChange = (newInputValue) => {
    const inputValue = newInputValue;
    this.setState({ inputValue });
    return inputValue;
  };

  handleOnChange = (newValue) => {
    if (newValue === undefined) {
      this.props.setValue(undefined);
    } else {
      this.props.setValue(toGeo(newValue));
    }
  }

  handleLoadOptions = (inputValue, callback) => {
    this.state.service.autosuggest({
      q: inputValue,
      // center of the search context
      at: '46.94843,7.44046'
    }, (result) => {
      callback(result.items.map(toSelect));
    }, alert);
  };

  render() {
    return <AsyncSelect
      defaultValue={toSelect(toHere(this.props.value))}
      defaultOptions={[toSelect(toHere(this.props.value))]}
      isDisabled={this.props.disabled}
      loadOptions={this.handleLoadOptions}
      onInputChange={this.handleOnInputChange}
      onChange={this.handleOnChange}
    />;
  }
}
