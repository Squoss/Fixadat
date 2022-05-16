import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { l10nContext } from "./l10nContext";

function NotFound(props: {}) {
  console.log("NotFound props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  return (
    <div className="alert alert-info" role="alert">
      <h4 className="alert-heading">{localizations['notFound.title']}</h4>
      <p>{localizations['notFound.page']}</p>
      <hr />
      <p className="mb-0"><Link to="/" className="alert-link"><i className="bi bi-house"></i></Link></p>
    </div>
  );
}

export default NotFound;
