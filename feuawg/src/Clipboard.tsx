import { useState } from "react";


interface ClipboardProps {
  text: string;
}

function Clipboard(props: ClipboardProps) {
  console.log("Clipboard props: " + JSON.stringify(props));

  const [copied, setCopied] = useState<boolean>(false);

  const writeToClipboard = () => navigator.clipboard.writeText(props.text).then(() => {
    console.log("succeeded in copying link to clipboard");
    setCopied(true);
  }).catch(error => {
    console.error(`failed to copy link to clipboard: ${error}`);
    setCopied(false);
  });

  /*
  const readFromClipboard = () => {
    navigator.clipboard.readText().then(text => {
      setCopied(text === props.text);
    }, () => {
      setCopied(false);
    });
  }

  useEffect(() => {
    const thisInterval = setTimeout(readFromClipboard, 1000);
    return function cleanup() {
      clearInterval(thisInterval);
    };
  });
  */

  return (<button type="button" className="btn btn-outline-dark" onClick={writeToClipboard}>{copied ? <i className="bi bi-clipboard-check"></i> : <i className="bi bi-clipboard"></i>}</button>);
}

export default Clipboard;
