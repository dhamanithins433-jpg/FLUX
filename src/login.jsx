import { useState } from "react";
import "./login.css";

function Login() {
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

  const roleData = {
    student: {
      title: "Student Login",
      subtitle: "Access your student portal",
      placeholder: "Enter Register Number",
      icon: "🎓"
    },

    faculty: {
      title: "Faculty Login",
      subtitle: "Access your faculty portal",
      placeholder: "Enter Faculty ID",
      icon: "👨‍🏫"
    },

    college: {
      title: "College Login",
      subtitle: "Access college administration",
      placeholder: "Enter College ID",
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
  signupData.password.length >= 8 &&
  /[A-Za-z]/.test(signupData.password) &&
  /[0-9]/.test(signupData.password) &&
  /[^A-Za-z0-9]/.test(signupData.password);

if (!strongPassword) {
  return;
}

  try {
    const response = await fetch(
      "http://localhost:5000/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
       body: JSON.stringify({
  name: signupData.name,
  registerNumber: signupData.registerNumber,
  department: signupData.department,
  email: signupData.email,
  password: signupData.password
})
      }
    );

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");

        setSignupData({
          name: "",
          registerNumber:"",
          department: "",
          email: "",
          password: "",
          confirmPassword: ""
        });

        setShowSignup(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  const handleLogin = (e) => {
  e.preventDefault();

  if (
    role === "student" &&
    signupData.registerNumber !== "" &&
    !/^\d+$/.test(signupData.registerNumber)
  ) {
    setRegisterNumberError(true);
    return;
  }

  // inga un existing authentication code
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

            <p className="brand-title">
              Sri Venkateswara College of Engineering and Technology
            </p>

            <div className="brand-line"></div>

            <p className="brand-description">
              Create your secure digital campus account and
              access your academic services from one place.
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


        {/* SIGNUP PANEL */}
        <div className="login-section">

          <div className="login-card signup-card">

            <div className="login-top">
              <p className="welcome-text">
                GET STARTED
              </p>

              <h2>
                Create Account
              </h2>

              <p className="login-subtitle">
                Register your details to access the student portal
              </p>
            </div>


            <form onSubmit={handleSignup}>

              {/* FULL NAME */}
              <div className="input-group">
                <label>Full Name</label>

                <div className="input-box">
                  <span className="input-icon">  👤 
                  
                </span>
                  
                  
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        name: e.target.value
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="input-group">

  <label>
    Register Number
  </label>

  <div className="input-box">

     <span className="input-icon">  🎓 
                  
                </span>


    <input
  type="text"
  inputMode="numeric"
  placeholder="Enter your register number"
  value={signupData.registerNumber}
  onChange={(e) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) {
      setRegisterNumberError(true);

      setTimeout(() => {
        setRegisterNumberError(false);
      }, 1500);

      return;
    }

    setSignupData({
      ...signupData,
      registerNumber: value
    });

    setRegisterNumberError(false);
  }}
  required
/>

</div>

{registerNumberError && (
  <p className="register-number-warning">
    ⚠ Register Number must contain numbers only
  </p>
)}

</div>

              {/* DEPARTMENT */}
              <div className="input-group">
                
                <label>Department</label>

                <div className="input-box signup-select-box">
                  <span className="input-icon"> 🏫  
                  
                </span>
                  <select
                    value={signupData.department}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        department: e.target.value
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select your department
                    </option>

                    <option value="B.E Computer Science Engineering">
                      B.E Computer Science Engineering
                    </option>

                    <option value="B.E Computer Science Engineering (Cybersecurity)">
                      B.E Computer Science Engineering (Cybersecurity)
                    </option>

                    <option value="B.E Artificial Intelligence and Machine Learning">
                      B.E Artificial Intelligence and Machine Learning
                    </option>

                    <option value="B.E Electronic and Communication Engineering">
                      B.E Electronic and Communication Engineering
                    </option>

                    <option value="B.E Electrical and Electronic Engineering">
                      B.E Electrical and Electronic Engineering
                    </option>

                    <option value="B.Tech Artificial Intelligence and Data Science">
                      B.Tech Artificial Intelligence and Data Science
                    </option>

                    <option value="B.Tech Information Technology">
                      B.Tech Information Technology
                    </option>
                  </select>

                  <span className="select-arrow">⌄</span>
                </div>
              </div>


              {/* EMAIL */}
              <div className="input-group">
                
                <label>Email Address</label>

                <div className="input-box">
                  <span className="input-icon">  ✉️ 
                  
                </span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        email: e.target.value
                      })
                    }
                    required
                  />
                </div>
              </div>


              {/* PASSWORD */}
              <div className="input-group">
                
                <label>Password</label>

                <div className="input-box">
                  <span className="input-icon">  🔑 
                  
                </span>
                  <input
  type={showSignupPassword ? "text" : "password"}
  placeholder="Create a password"
  value={signupData.password}
  onChange={(e) => {
  const value = e.target.value;

  setSignupData({
    ...signupData,
    password: value
  });

  const strongPassword =
    value.length >= 8 &&
    /[A-Za-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

  setPasswordError(value.length > 0 && !strongPassword);
}}
  required
/>

<button
  type="button"
  className="signup-password-toggle"
  onClick={() =>
    setShowSignupPassword(!showSignupPassword)
  }
>
  {showSignupPassword ? "Hide" : "Show"}
</button>
                </div>
              </div>
              {passwordError && (
  <p className="password-strength-warning">
    ⚠ Password must contain at least 8 characters, an alphabet, a number, and a special character
  </p>
)}
              <div className="input-group">

                {/* re enter */}

  <label>
    Re-enter Password
  </label>

  <div className="input-box">

    <span className="signup-input-icon">
      🔒
    </span>

    <input
      type={
        showSignupPassword
          ? "text"
          : "password"
      }
      placeholder="Re-enter your password"
      value={signupData.confirmPassword}
      onChange={(e) => {
  const value = e.target.value;

  setSignupData({
    ...signupData,
    confirmPassword: value
  });

  setPasswordMismatch(
    value.length > 0 &&
    value !== signupData.password
  );
}}
      required
    />

    <button
      type="button"
      className="signup-password-toggle"
      onClick={() =>
        setShowSignupPassword(!showSignupPassword)
      }
    >
      {showSignupPassword ? "Hide" : "Show"}
    </button>

  </div>

</div>
{passwordMismatch && (
  <p className="password-warning">
    ⚠ Passwords do not match
  </p>
)}


              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                className="main-login-btn"
              >
                Create Account
                <span>→</span>
              </button>


              {/* BACK TO LOGIN */}
              <div className="create-account signup-back">
                <span>
                  Already have an account?
                </span>

                <button
  type="button"
  className="create-account-btn"
  onClick={() => {
    setShowSignup(false);

    setSignupData({
      name: "",
      registerNumber: "",
      department: "",
      email: "",
      password: "",
      confirmPassword: ""
    });

    setShowSignupPassword(false);
    setShowConfirmPassword(false);
    setPasswordMismatch(false);
  }}
>
  Back to Login
</button>
              </div>

            </form>


            <div className="secure-note">
              🔒 Your information is protected with secure authentication
            </div>

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

            <p className="welcome-text">
              WELCOME BACK
            </p>

            <h2>
              {currentRole.title}
            </h2>

            <p className="login-subtitle">
              {currentRole.subtitle}
            </p>

          </div>


          {/* ROLE SELECTOR */}
          <div className="role-selector">

            <button
              type="button"
              className={
                role === "student"
                  ? "role active"
                  : "role"
              }
              onClick={() => setRole("student")}
            >
              <span>🎓</span>
              <small>Student</small>
            </button>

            <button
              type="button"
              className={
                role === "faculty"
                  ? "role active"
                  : "role"
              }
              onClick={() => setRole("faculty")}
            >
              <span>👨‍🏫</span>
              <small>Faculty</small>
            </button>

            <button
              type="button"
              className={
                role === "college"
                  ? "role active"
                  : "role"
              }
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
  inputMode="numeric"
  placeholder={currentRole.placeholder}
  value={loginData.userId}
  onChange={(e) => {
    const value = e.target.value;

    if (role === "student" && /^\d*$/.test(value)) {
      setLoginData({
        ...loginData,
        userId: value
      });
    }
  }}
  required
/>

  </div>

  {role === "student" && registerNumberError && (
    <p className="register-number-warning">
      ⚠ Register Number must contain numbers only
    </p>
  )}

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
  value={loginData.password}
  onChange={(e) =>
    setLoginData({
      ...loginData,
      password: e.target.value
    })
  }
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


            <button
              type="submit"
              className="main-login-btn"
            >
              Login
              <span>→</span>
            </button>


            {/* CREATE ACCOUNT */}
            <div className="create-account">

              <span>
                Don't have an account?
              </span>

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
            🔐 Your information is protected with secure authentication
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;