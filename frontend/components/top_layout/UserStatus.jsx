import { Link } from "react-router-dom";

export default function UserStatus({ accessToken, decodedUser }) {
  const isLoggedIn = !!accessToken;

  return (
    <div className="flex items-center gap-6 text-yellow-300">
      {!isLoggedIn ? (
        <Link to="/login" className="hover:text-yellow-400 transition-colors">
          Login
        </Link>
      ) : (
        <>
          <span className="font-medium">Hello, XXX</span>
          <Link className="hover:text-yellow-400 transition-colors">
            Orders
          </Link>
        </>
      )}
    </div>
  );
}
