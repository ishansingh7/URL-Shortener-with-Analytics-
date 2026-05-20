import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/urlHelpers";
import "./Auth.css";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify(res.data)
      );

      alert("Registration Successful");

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Registration Failed"
      );

    }
  };

  return (
    <div className="auth-page">

      <div className="auth-left">

        <h1>Create Account 🚀</h1>

        <p>
          Register now to shorten links and create QR codes instantly.
        </p>

      </div>

      <div className="auth-container">

        <div className="auth-card">

          <h2>Register</h2>

          <span>Create your account</span>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="input-group">

              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="input-group">

              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>

            <button type="submit">
              Register
            </button>

          </form>

          <p className="bottom-text">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;