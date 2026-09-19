import { useState } from "react";
import "./login.css";

const API_BASE = "http://localhost:5001/api";

function Login({ onLoginSuccess }) {
  const [showSignup, setShowSignup] = useState(false);

  const [signupData, setSignupData] = useState({
    name: "",
    registerNumber: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    userId: "",
    password: ""
  });

  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [registerNumberError, setRegisterNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleData = {
    student: {
      title: "Student Login",
      subtitle: "Access your attendance, marks & fees portal",
      placeholder: "Enter Register Number (e.g. SVCET001)",
      icon: "🎓"
    },
    faculty: {
      title: "Faculty Login",
      subtitle: "Manage daily attendance & academic marks",
      placeholder: "Enter Faculty ID (e.g. FAC001)",
      icon: "👨‍🏫"
    },
    college: {
      title: "College Administrator Login",
      subtitle: "Institutional records, fees & accounts administration",
      placeholder: "Enter Admin ID (e.g. ADM001)",
      icon: "🏛️"
    }
  };

  const currentRole = roleData[role];



  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const strongPassword =
      signupData.password.length >= 6 &&
      /[A-Za-z]/.test(signupData.password) &&
      /[0-9]/.test(signupData.password);

    if (!strongPassword) {
      alert("Password must be at least 6 characters and contain letters and numbers");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          registerNumber: signupData.registerNumber,
          department: signupData.department,
          email: signupData.email,
          password: signupData.password,
          role: "student"
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Please login with your credentials.");
        setLoginData({
          userId: signupData.registerNumber,
          password: signupData.password
        });
        setRole("student");
        setShowSignup(false);
        setSignupData({
          name: "",
          registerNumber: "",
          department: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed. Please ensure the backend is running.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: loginData.userId,
          password: loginData.password,
          role: role
        })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.user) {
        if (data.token) {
          localStorage.setItem("svcet_token", data.token);
        }
        localStorage.setItem("svcet_user", JSON.stringify(data.user));

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      } else {
        setLoginError(data.message || "Invalid ID or Password for the selected role.");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      setLoginError("Could not connect to Python backend on port 5001. Please check the server status.");
    }
  };

  /* ================= SIGNUP PAGE ================= */
  if (showSignup) {
    return (
      <div className="login-page">
        {/* LEFT BRAND PANEL */}
        <div className="login-brand">
          <div className="brand-glow"></div>
          <div className="brand-content">
            <h1>SVCET</h1>
            <p className="brand-title">Sri Venkateswara College of Engineering and Technology</p>
            <div className="brand-line"></div>
            <p className="brand-description">
              Create your secure digital campus account and access attendance, marks, and fee payment services in one place.
            </p>
            <div className="brand-features">
              <div><span>✓</span> Real-Time Attendance Tracking</div>
              <div><span>✓</span> Examination Marksheets & CGPA</div>
              <div><span>✓</span> Instant Online Fee Payments</div>
            </div>
          </div>
          <div className="brand-bottom">© 2026 SVCET • Digital Campus Portal</div>
        </div>

        {/* SIGNUP PANEL */}
        <div className="login-section">
          <div className="login-card signup-card">
            <div className="login-top">
              <p className="welcome-text">GET STARTED</p>
              <h2>Create Student Account</h2>
              <p className="login-subtitle">Register your details to access the institutional portal</p>
            </div>

            <form onSubmit={handleSignup}>
              {/* FULL NAME */}
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-box">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* REGISTER NUMBER */}
              <div className="input-group">
                <label>Register Number</label>
                <div className="input-box">
                  <span className="input-icon">🎓</span>
                  <input
                    type="text"
                    placeholder="e.g. SVCET006 or 11223344"
                    value={signupData.registerNumber}
                    onChange={(e) => setSignupData({ ...signupData, registerNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className="input-group">
                <label>Department</label>
                <div className="input-box signup-select-box">
                  <span className="input-icon">🏫</span>
                  <select
                    value={signupData.department}
                    onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select your department</option>
                    <option value="Computer Science Engineering">B.E Computer Science Engineering</option>
                    <option value="Information Technology">B.Tech Information Technology</option>
                    <option value="Electronics & Communication">B.E Electronics and Communication</option>
                    <option value="Mechanical Engineering">B.E Mechanical Engineering</option>
                    <option value="Electrical & Electronics">B.E Electrical and Electronics</option>
                    <option value="Artificial Intelligence and Data Science">B.Tech AI & Data Science</option>
                  </select>
                  <span className="select-arrow">⌄</span>
                </div>
              </div>

              {/* EMAIL */}
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-box">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="input-group">
                <label>Password</label>
                <div className="input-box">
                  <span className="input-icon">🔑</span>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Create password (min 6 chars, letters & numbers)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="input-group">
                <label>Re-enter Password</label>
                <div className="input-box">
                  <span className="signup-input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => {
                      setSignupData({ ...signupData, confirmPassword: e.target.value });
                      setPasswordMismatch(e.target.value !== signupData.password);
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {passwordMismatch && <p className="password-warning">⚠ Passwords do not match</p>}

              {/* CREATE ACCOUNT */}
              <button type="submit" className="main-login-btn">
                Create Account <span>→</span>
              </button>

              {/* BACK TO LOGIN */}
              <div className="create-account signup-back">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="create-account-btn"
                  onClick={() => setShowSignup(false)}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ================= LOGIN PAGE ================= */
  return (
    <div className="login-page">
      {/* LEFT SIDE */}
      <div className="login-brand">
        <div className="brand-glow"></div>
        <div className="brand-content">
          <h1>SVCET</h1>
          <p className="brand-title">Sri Venkateswara College of Engineering and Technology</p>
          <div className="brand-line"></div>
          <p className="brand-description">
            Welcome to the secure institutional campus portal. Access attendance, academic marksheets, financial fees, and payment gateways from one unified hub.
          </p>

          <div className="brand-features">
            <div><span>✓</span> Daily Attendance & Eligibility Records</div>
            <div><span>✓</span> Continuous Assessment Marksheets</div>
            <div><span>✓</span> Real-Time Online & Offline Fee Receipts</div>
            <div><span>✓</span> Institutional Role-Based Access Control</div>
          </div>
        </div>

        <div className="brand-bottom">© 2026 SVCET • Digital Campus Portal</div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-section">
        <div className="login-card">
          <div className="login-top">
            <p className="welcome-text">WELCOME BACK</p>
            <h2>{currentRole.title}</h2>
            <p className="login-subtitle">{currentRole.subtitle}</p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="role-selector">
            <button
              type="button"
              className={role === "student" ? "role active" : "role"}
              onClick={() => {
                setRole("student");
                setLoginData({ userId: "", password: "" });
                setLoginError("");
              }}
            >
              <span>🎓</span>
              <small>Student</small>
            </button>

            <button
              type="button"
              className={role === "faculty" ? "role active" : "role"}
              onClick={() => {
                setRole("faculty");
                setLoginData({ userId: "", password: "" });
                setLoginError("");
              }}
            >
              <span>👨‍🏫</span>
              <small>Faculty</small>
            </button>

            <button
              type="button"
              className={role === "college" ? "role active" : "role"}
              onClick={() => {
                setRole("college");
                setLoginData({ userId: "", password: "" });
                setLoginError("");
              }}
            >
              <span>🏛️</span>
              <small>Admin</small>
            </button>
          </div>

          {loginError && (
            <div className="login-error-alert">
              ⚠ {loginError}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>
                {role === "student" ? "Register Number" : role === "faculty" ? "Faculty ID" : "Administrator ID"}
              </label>

              <div className="input-box">
                <span className="input-icon">{currentRole.icon}</span>
                <input
                  type="text"
                  placeholder={currentRole.placeholder}
                  value={loginData.userId}
                  onChange={(e) => setLoginData({ ...loginData, userId: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-box">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert(`Demo passwords:\nStudent: student123\nFaculty: faculty123\nAdmin: admin123`)
                }
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="main-login-btn" disabled={isSubmitting}>
              {isSubmitting ? "Verifying Credentials..." : "Login"}
              <span>→</span>
            </button>

            {/* CREATE ACCOUNT */}
            <div className="create-account">
              <span>Student without an account?</span>
              <button
                type="button"
                className="create-account-btn"
                onClick={() => setShowSignup(true)}
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="secure-note">
            🔐 Protected by Python REST API & MySQL with 256-bit Token Authentication
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;