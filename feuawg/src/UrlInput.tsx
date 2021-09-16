import { useEffect, useState } from 'react';
import { get } from './fetchJson';

interface ValidityType {
  url: string;
  valid: boolean;
}

interface UrlInputProps {
  id: string;
  readOnly: boolean;
  url?: string;
  setUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function UrlInput(props: UrlInputProps) {
  console.log("UrlInput props: " + JSON.stringify(props));

  const [potentiallyInvalidUrl, setPotentiallyInvalidUrl] = useState(props.url ? props.url : "");
  const [urlValid, setUrlValid] = useState(true);

  useEffect(() => {
    const getValidity = () => get<ValidityType>(`/validity?url=${potentiallyInvalidUrl}`, "").then(responseJson => {
      console.debug(responseJson.status);
      console.debug(responseJson.parsedBody);
      if (responseJson.status === 200) {
        setUrlValid(responseJson.parsedBody!.valid);
        if (responseJson.parsedBody!.valid) {
          props.setUrl(potentiallyInvalidUrl);
        } else {
          props.setUrl(props.url);
        }
      }
    }).catch(error => console.error(`failed to get validity: ${error}`));

    if (potentiallyInvalidUrl === "") {
      setUrlValid(true);
      props.setUrl(undefined);
    } else {
      getValidity();
    }
  }, [potentiallyInvalidUrl, props]);


  return (
    <input type="url" placeholder="https://teamsorzoomorso.com/conferences/1234567890" id={props.id} className={"form-control" + (props.readOnly || potentiallyInvalidUrl === "" ? "" : (urlValid ? " is-valid" : " is-invalid"))} value={potentiallyInvalidUrl} onChange={event => setPotentiallyInvalidUrl(event.target.value)} readOnly={props.readOnly} />
  );
}

export default UrlInput;
