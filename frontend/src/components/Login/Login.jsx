import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // HANDLE INPUT
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  // HANDLE LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // START LOADING
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      // SAVE USER
      localStorage.setItem(
        "userInfo",
        JSON.stringify(res.data)
      );

      // SMALL DELAY FOR SMOOTH LOADING
      setTimeout(() => {

        navigate("/dashboard");

      }, 1500);

    } catch (error) {

      setLoading(false);

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    }
  };

  // LOADING SCREEN
  if (loading) {
    return (

      <div className="loading-screen">

        <div className="loader"></div>

        <h2>Logging You In...</h2>

        <p>
          Redirecting to your dashboard
        </p>

      </div>

    );
  }

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}

      <div className="auth-left">

        <div>

          <h1>
            Welcome Back 👋
          </h1>

          <p>
            Login to continue shortening URLs,
            generating QR codes, and managing
            all your smart links professionally.
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="auth-container">

        <div className="auth-card">

          <h2>Login</h2>

          <span>
            Access your account securely
          </span>

          {/* FORM */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>

            {/* BUTTON */}

            <button type="submit">
              Login
            </button>

          </form>

          {/* FOOTER */}

          <p className="bottom-text">

            Don’t have an account?

            <Link to="/register">
              {" "}Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;