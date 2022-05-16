import { useEffect, useState } from 'react';
import { get } from './fetchJson';

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

  const [potentiallyInvalidValue, setPotentiallyInvalidValue] = useState(props.value ? props.value : "");
  const [valueValid, setValueValid] = useState(true);

  useEffect(() => {
    const getValidity = () => get<ValidityType>(`/iapi/validations/${props.validation}=${potentiallyInvalidValue}`, "").then(responseJson => {
      console.debug(responseJson.status);
      console.debug(responseJson.parsedBody);
      if (responseJson.status === 200) {
        setValueValid(responseJson.parsedBody!.valid);
        if (responseJson.parsedBody!.valid) {
          props.setValue(potentiallyInvalidValue);
        } else {
          props.setValue(props.value);
        }
      }
    }).catch(error => console.error(`failed to get validity: ${error}`));

    if (potentiallyInvalidValue === "") {
      setValueValid(true);
      props.setValue(undefined);
    } else {
      getValidity();
    }
  }, [potentiallyInvalidValue, props]);


  return (
    <input type={props.type} placeholder={props.placeholder} id={props.id} className={"form-control" + (props.readOnly || potentiallyInvalidValue === "" ? "" : (valueValid ? " is-valid" : " is-invalid"))} value={props.readOnly ? (props.value ? props.value : "") : potentiallyInvalidValue} onChange={event => setPotentiallyInvalidValue(event.target.value)} readOnly={props.readOnly} />
  );
}

export default ValidatingInput;
