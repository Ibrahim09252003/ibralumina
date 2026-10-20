import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page not-found">
      <h1>404</h1>
      <p>Oops — we couldn't find that page.</p>
      <Link to="/" className="button primary">Back to home</Link>
    </div>
  );
}

export default NotFound;