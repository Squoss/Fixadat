import { Link } from 'react-router-dom';

function NotFound(props: {}) {
  console.log("NotFound props: " + JSON.stringify(props));

  return (
    <div className="alert alert-info" role="alert">
      <h4 className="alert-heading">Not Found</h4>
      <p>The page that you have requested has not been found.</p>
      <hr />
      <p className="mb-0"><Link to="/" className="alert-link"><i className="bi-house"></i></Link></p>
    </div>
  );
}

export default NotFound;
