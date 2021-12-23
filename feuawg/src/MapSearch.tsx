/*
 * The MIT License
 *
 * Copyright (c) 2021 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// https://docs.microsoft.com/en-us/heremaps/v8-web-control/map-control-concepts/autosuggest-module-examples/default-autosuggest-user-interface-example

import React, { useState } from "react";
import { ActionMeta, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import { Geo } from "./Events";
import { get } from "./fetchJson";

interface MapSearchProps {
  id: string;
  disabled: boolean;
  value?: Geo;
  setValue: React.Dispatch<React.SetStateAction<Geo | undefined>>;
}

interface Select {
  label: string;
  value: Geo;
}

interface Item {
  title: string;
  position: { lat: number; lng: number };
}

function MapSearch(props: MapSearchProps) {
  console.log("MapSearch props: " + JSON.stringify(props));

  const toSelect = (fromGeo?: SingleValue<Geo>) => {
    return fromGeo === undefined || fromGeo === null
      ? null
      : {
          label: fromGeo.name === undefined ? "un" : fromGeo.name,
          value: {
            name: fromGeo.name === undefined ? "un" : fromGeo.name,
            longitude: fromGeo.longitude,
            latitude: fromGeo.latitude,
          },
        };
  };

  const toGeo = (fromSelect?: SingleValue<Select>) => {
    return fromSelect === undefined || fromSelect === null
      ? undefined
      : {
          name: fromSelect.label,
          longitude: fromSelect.value.longitude,
          latitude: fromSelect.value.latitude,
        };
  };

  const [inputValue, setInputValue] = useState("");

  const getItems = (inputValue: string) =>
    get<{items: Array<Item>}>(
      `/maps?query=${inputValue}`, ""
    )
      .then((responseJson) => {
        console.debug(responseJson.status);
        console.debug(responseJson.parsedBody);
        return responseJson.parsedBody?.items;
      })
      .then((items) =>
        items?.map((item) => {
          return {
            label: item.title,
            value: {
              name: item.title,
              longitude: item.position.lng,
              latitude: item.position.lat,
            },
          };
        })
      )
      .catch((error) => console.error(`failed to get items: ${error}`));

  const handleOnInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleOnSelectChange = (
    newValue: SingleValue<Select>,
    actionMeta: ActionMeta<Select>
  ) => {
    if (newValue === undefined) {
      props.setValue(undefined);
    } else {
      props.setValue(toGeo(newValue));
    }
  };

  return (
    <React.Fragment>
      <AsyncSelect
        defaultValue={toSelect(props.value)}
        isDisabled={props.disabled}
        loadOptions={getItems}
        onInputChange={handleOnInputChange}
        onChange={handleOnSelectChange}
      />
    </React.Fragment>
  );
}

export default MapSearch;
