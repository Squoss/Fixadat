/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
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

import { useEffect, useState } from "react";
import { fetchResource, Method } from "./fetchJson";

interface ValidityType {
  value: string;
  valid: boolean;
}

interface ValidatingInputProps {
  id: string;
  type: string;
  placeholder: string;
  readOnly: boolean;
  value?: string;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  validation: string;
}

function ValidatingInput(props: ValidatingInputProps) {
  console.log("ValidatingInput props: " + JSON.stringify(props));

  const [potentiallyInvalidValue, setPotentiallyInvalidValue] = useState(
    props.value ? props.value : ""
  );
  const [valueValid, setValueValid] = useState(true);

  useEffect(() => {
    const getValidity = () =>
      fetchResource<ValidityType>(
        Method.Get,
        `/iapi/validations/${props.validation}=${potentiallyInvalidValue}`
      )
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`HTTP status ${response.status} instead of 200`);
          } else {
            setValueValid(response.parsedBody!.valid);
            if (response.parsedBody!.valid) {
              props.setValue(potentiallyInvalidValue);
            } else {
              props.setValue(props.value);
            }
          }
        })
        .catch((error) => console.error(`failed to get validity: ${error}`));

    if (potentiallyInvalidValue === "") {
      setValueValid(true);
      props.setValue(undefined);
    } else {
      getValidity();
    }
  }, [potentiallyInvalidValue, props]);

  return (
    <input
      type={props.type}
      placeholder={props.placeholder}
      id={props.id}
      className={
        "form-control" +
        (props.readOnly || potentiallyInvalidValue === ""
          ? ""
          : valueValid
          ? " is-valid"
          : " is-invalid")
      }
      value={
        props.readOnly
          ? props.value
            ? props.value
            : ""
          : potentiallyInvalidValue
      }
      onChange={(event) => setPotentiallyInvalidValue(event.target.value)}
      readOnly={props.readOnly}
    />
  );
}

export default ValidatingInput;
