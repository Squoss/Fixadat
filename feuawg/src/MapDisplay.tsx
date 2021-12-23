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

import React from "react";
import { Geo } from "./Events";

interface MapDisplayProps {
  value?: Geo;
}

function MapDisplay(props: MapDisplayProps) {
  console.log("MapDisplay props: " + JSON.stringify(props));

  const apiKey = document
    .querySelector("meta[name='here-maps-api-key']")!
    .getAttribute("content")!;
  const zoomLevel = 16;

  return props.value === undefined ? (
    <div />
  ) : (
    <React.Fragment>
      <a
        href={`https://wego.here.com/?map=${props.value.latitude},${props.value.longitude},${zoomLevel}`}
        target="HEREWeGo"
      >
        <img
          alt={`a map${props.value.name ? ` of ${props.value.name}` : ""}`}
          src={`https://image.maps.ls.hereapi.com/mia/1.6/mapview?apiKey=${apiKey}&c=${props.value.latitude},${props.value.longitude}&h=540&w=960&z=${zoomLevel}`}
        />
      </a>
    </React.Fragment>
  );
}

export default MapDisplay;
