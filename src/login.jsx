import { useState } from "react";
import "./login.css";

function Login() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const roleData = {
    student: {
      title: "Student Login",
      subtitle: "Access your student portal",
      placeholder: "Enter Register Number",
      icon: "🎓",
    },

    faculty: {
      title: "Faculty Login",
      subtitle: "Access your faculty portal",
      placeholder: "Enter Faculty ID",
      icon: "👨‍🏫",
    },

    college: {
      title: "College Login",
      subtitle: "Access college administration",
      placeholder: "Enter College ID",
      icon: "🏛️",
    },
  };

  const currentRole = roleData[role];

  const handleLogin = (e) => {
    e.preventDefault();

    alert(`${role.toUpperCase()} login clicked`);
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-brand">

        <div className="brand-glow"></div>

        <div className="brand-content">

          

          <h1>SVCET</h1>

          <p className="brand-title">
            Sri Venkateswara College of Engineering and Technology
          </p>

          <div className="brand-line"></div>

          <p className="brand-description">
            Welcome to the secure digital campus portal.
            Access academic, faculty and administrative services
            from one place.
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              Secure Access
            </div>

            <div>
              <span>✓</span>
              Smart Campus
            </div>

            <div>
              <span>✓</span>
              One Portal
            </div>
          </div>

        </div>

        <div className="brand-bottom">
          © 2026 SVCE • Digital Campus
        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="login-section">

        <div className="login-card">

          <div className="login-top">
            <p className="welcome-text">WELCOME BACK</p>

            <h2>{currentRole.title}</h2>

            <p className="login-subtitle">
              {currentRole.subtitle}
            </p>
          </div>


          {/* ROLE SELECTOR */}
          <div className="role-selector">

            <button
              type="button"
              className={role === "student" ? "role active" : "role"}
              onClick={() => setRole("student")}
            >
              <span>🎓</span>
              <small>Student</small>
            </button>

            <button
              type="button"
              className={role === "faculty" ? "role active" : "role"}
              onClick={() => setRole("faculty")}
            >
              <span>👨‍🏫</span>
              <small>Faculty</small>
            </button>

            <button
              type="button"
              className={role === "college" ? "role active" : "role"}
              onClick={() => setRole("college")}
            >
              <span>🏛️</span>
              <small>College</small>
            </button>

          </div>


          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>

            <div className="input-group">

              <label>
                {role === "student"
                  ? "Register Number"
                  : role === "faculty"
                  ? "Faculty ID"
                  : "College ID"}
              </label>

              <div className="input-box">

                <span className="input-icon">
                  {currentRole.icon}
                </span>

                <input
                  type="text"
                  placeholder={currentRole.placeholder}
                  required
                />

              </div>

            </div>


            <div className="input-group">

              <label>Password</label>

              <div className="input-box">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>


            <div className="login-options">

              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot Password?
              </button>

            </div>


            <button type="submit" className="main-login-btn">
              Login
              <span>→</span>
            </button>

          </form>


          <div className="secure-note">
            🔐 Your information is protected with secure authentication
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;