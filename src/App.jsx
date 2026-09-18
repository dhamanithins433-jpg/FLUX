import { useState } from "react";
import Login from "./login";
import AdminPortal from "./components/AdminPortal";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import CSECourseHub from "./components/courses/CSECourseHub";
import DepartmentCourseHub from "./components/courses/DepartmentCourseHub";
import React from "react";

import "./App.css";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube
} from "react-icons/fa";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("svcet_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeMenu, setActiveMenu] = useState("home");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("svcet_token");
    localStorage.removeItem("svcet_user");
    setCurrentUser(null);
    setActiveMenu("home");
  };

  // Navigation function
  const navigateTo = (page) => {
    setActiveMenu(page);
  };

  // Menu Data (Sidebar navigation - strictly site sections, no sidebar login)
  const menuItems = [
    {
      id: "home",
      icon: "🏠",
      name: "Home"
    },
    {
      id: "courses",
      icon: "🎓",
      name: "Courses"
    },
    {
      id: "achievements",
      icon: "🏆",
      name: "Achievements"
    },
    {
      id: "placement",
      icon: "💼",
      name: "Placement"
    },
    {
      id: "contact",
      icon: "📞",
      name: "Contact"
    }
  ];

  // Department & Courses Data (Expanded list of 13 academic programs)
  const departments = [
    {
      code: "CSE",
      icon: "💻",
      title: "Computer Science Engineering",
      description: "Learn programming, artificial intelligence, cloud architectures, cybersecurity, and modern technologies."
    },
    {
      code: "AIDS",
      icon: "🤖",
      title: "AI & Data Science",
      description: "Master machine learning algorithms, deep neural networks, computer vision, NLP, and big data systems."
    },
    {
      code: "IT",
      icon: "🖥️",
      title: "Information Technology",
      description: "Build robust enterprise software, full-stack systems, cloud architectures, and DevOps pipelines."
    },
    {
      code: "CSBS",
      icon: "📊",
      title: "AI & machine learning",
      description: "TCS-curated curriculum blending digital computing technologies with financial and business analytics."
    },
    {
      code: "CYBER",
      icon: "🛡️",
      title: "Cyber Security",
      description: "Specialized defense curriculum in ethical hacking, cryptography, threat intelligence, and digital forensics."
    },
    {
      code: "ECE",
      icon: "📡",
      title: "Electronics & Communication",
      description: "Explore VLSI chip design, embedded microcontrollers, satellite communications, and IoT sensor systems."
    },
    {
      code: "EEE",
      icon: "⚡",
      title: "Electrical & Electronics",
      description: "Power electronics, smart electric grid systems, renewable solar/wind energy, and EV powertrain design."
    },
    {
      code: "MECH",
      icon: "⚙️",
      title: "Mechanical Engineering",
      description: "Robotics, automation, mechatronics, CAD/CAM modeling, finite element analysis, and Industry 4.0."
    },
    {
      code: "CIVIL",
      icon: "🏢",
      title: "Civil Engineering",
      description: "Smart infrastructure design, structural analysis, green building architecture, and modern geoinformatics."
    },
    {
      code: "BME",
      icon: "🔋",
      title: "M.E. Power Electronics & Drives",
      description: "Genetic engineering, bio-sensors, biomedical instrumentation, bioinformatics, and healthcare AI."
    },
    {
      code: "ME-CSE",
      icon: "🔬",
      title: "M.E. Computer Science and Engineering",
      description: "Postgraduate research program in advanced distributed algorithms, high-performance computing, and AI."
    },
    {
      code: "MBA",
      icon: "📈",
      title: "Master of Business Administration (MBA)",
      description: "Executive management program covering Finance, Human Resources, Digital Marketing, and Operations."
    },
    {
      code: "MCA",
      icon: "📱",
      title: "Master of Computer Applications (MCA)",
      description: "Advanced applications engineering, modern cloud platforms, mobile app architecture, and IT systems."
    },
    {
      code: "ECE",
      icon: "🔌",
      title: "M.E.VLSI Design",
      description: "Advanced applications engineering, modern cloud platforms, mobile app architecture, and IT systems."
    }
  ];

  // Achievements Data
  const achievementsList = [
    {
      icon: "🎖️",
      tag: "ACCREDITATION",
      title: "NAAC 'A+' Grade Accreditation",
      description: "Conferred with premier 'A+' Grade by National Assessment and Accreditation Council for outstanding pedagogical quality and research infrastructure."
    },
    {
      icon: "🌍",
      tag: "GLOBAL BENCHMARK",
      title: "NBA Tier-1 Global Accreditation",
      description: "Core undergraduate engineering programs accredited under the Washington Accord, ensuring global degree recognition worldwide."
    },
    {
      icon: "🏛️",
      tag: "ACADEMIC FREEDOM",
      title: "UGC Autonomous Institution",
      description: "Granted academic autonomy by UGC and Anna University, Chennai to continuously update course syllabi with emerging global tech trends."
    },
    {
      icon: "💡",
      tag: "RESEARCH & PATENTS",
      title: "50+ Patents & Research Grants",
      description: "Over ₹3.8 Crores in sponsored funding from DST-FIST, SERB, AICTE, and MSME, with more than 50 published and granted intellectual properties."
    },
    {
      icon: "🥇",
      tag: "NATIONAL HONORS",
      title: "Smart India Hackathon Champions",
      description: "SVCET student innovator teams consecutively bagged 1st prizes across Healthcare, AI, and Clean Energy categories at national finals."
    },
    {
      icon: "🤝",
      tag: "INDUSTRY TIE-UPS",
      title: "35+ Global MoUs & Tech Centers",
      description: "Active industry partnerships with TCS, Infosys, Wipro, IBM, Cisco Networking Academy, and foreign university exchange programs."
    }
  ];

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        {/* COLLEGE LOGO */}
        <div className="sidebar-logo">
          <img src="/college-logo.png" alt="College Logo" />
          <h1>SVCET</h1>
          <p>College Portal</p>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={
                activeMenu === item.id || (item.id === "courses" && activeMenu === "cse-course")
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigateTo(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-footer">
          <span>Learn</span>
          <span>|</span>
          <span>Grow</span>
          <span>|</span>
          <span>Succeed</span>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {/* ================= HEADER (ONE NAVBAR LOGIN) ================= */}
        <header className="top-header">
          <div className="header-left">
            <img src="/college-logo.png" alt="College Logo" />
            <div>
              <h1>SRI VENKATESWARA</h1>
              <p>College of Engineering and Technology</p>
            </div>
          </div>

          <div className="header-right">
            <p>An Autonomous Institution</p>
            {!currentUser ? (
              activeMenu !== "login" && (
                <button
                  className="login-button"
                  onClick={() => navigateTo("login")}
                >
                  Login
                </button>
              )
            ) : (
              <div className="header-logged-actions">
                <button
                  className="login-button"
                  onClick={() => navigateTo("portal")}
                >
                  {currentUser.role === "college"
                    ? "Admin Portal"
                    : currentUser.role === "faculty"
                    ? "Faculty Portal"
                    : "Student Portal"}
                </button>
                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= HOME ================= */}
        {activeMenu === "home" && (
          <section id="home" className="hero-section">
            {/* HERO TEXT */}
            <div className="hero-content">
              <div className="hero-tag">
                <span>KNOWLEDGE</span>
                <span>|</span>
                <span>INNOVATION</span>
                <span>|</span>
                <span>EXCELLENCE</span>
              </div>

              <h1>
                Welcome to
                <br />
                Sri Venkateswara College
                <br />
                of Engineering and Technology
              </h1>

              <p>
                Empowering Students Through
                <br />
                Knowledge, Innovation and Excellence
              </p>

              <button
                className="explore-button"
                onClick={() => navigateTo("courses")}
              >
                Explore Courses →
              </button>
            </div>

            {/* HERO IMAGE */}
            <div className="hero-image">
              <img src="college-campus.png" alt="College Campus" />
              <div className="slider-dots">
                <span className="active-dot"></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </section>
        )}

        {/* ================= COURSES ================= */}
        {activeMenu === "courses" && (
          <section id="courses" className="courses-section">
            <div className="section-header">
              <div>
                <span className="section-title">ACADEMICS & PROGRAMS</span>
                <h2>Our Academic Departments</h2>
                <p>Explore our wide range of Undergraduate, Postgraduate & Research Programs</p>
              </div>
              <button className="view-course-button">
                13 Accredited Programs
              </button>
            </div>

            {/* DEPARTMENT CARDS */}
            <div className="department-grid">
              {departments.map((department, index) => {
                const isCSE = department.title === "Computer Science Engineering" || department.code === "CSE";
                return (
                  <div
                    className="department-card featured-cse"
                    key={index}
                    onClick={() => {
                      if (isCSE) {
                        navigateTo("cse-course");
                      } else {
                        setSelectedDepartment(department);
                        navigateTo("department-course");
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="featured-pill">Curriculum & Materials Hub</span>
                    <div className="department-icon">{department.icon}</div>
                    <h3>{department.title}</h3>
                    <p>{department.description}</p>
                    <button
                      className="explore-cse-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCSE) {
                          navigateTo("cse-course");
                        } else {
                          setSelectedDepartment(department);
                          navigateTo("department-course");
                        }
                      }}
                    >
                      Explore Curriculum & Materials →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= CSE COURSE & STUDY MATERIALS HUB ================= */}
        {activeMenu === "cse-course" && (
          <CSECourseHub onBackToCourses={() => navigateTo("courses")} />
        )}

        {/* ================= MULTI-DEPARTMENT COURSE & STUDY MATERIALS HUB ================= */}
        {activeMenu === "department-course" && selectedDepartment && (
          <DepartmentCourseHub
            courseCode={selectedDepartment.code}
            courseName={selectedDepartment.title}
            onBackToCourses={() => navigateTo("courses")}
          />
        )}

        {/* ================= ACHIEVEMENTS ================= */}
        {activeMenu === "achievements" && (
          <section id="achievements" className="achievements-section">
            <div className="achievement-heading">
              <span>EXCELLENCE & RECOGNITION</span>
              <h2>Our Institutional Achievements</h2>
              <p>Celebrating Decades of Academic Distinction, Innovation & Leadership</p>
            </div>

            {/* STAT COUNTERS */}
            <div className="stats-container">
              <div className="stat-box">
                <div>🎓</div>
                <h2>6500+</h2>
                <p>Students & Alumni</p>
              </div>

              <div className="stat-box">
                <div>👨‍🏫</div>
                <h2>280+</h2>
                <p>Faculty (85+ Ph.D.)</p>
              </div>

              <div className="stat-box">
                <div>🏢</div>
                <h2>13+</h2>
                <p>Accredited Programs</p>
              </div>

              <div className="stat-box">
                <div>🏆</div>
                <h2>180+</h2>
                <p>National & State Awards</p>
              </div>

              <div className="stat-box">
                <div>🔬</div>
                <h2>50+</h2>
                <p>Patents Filed & Granted</p>
              </div>

              <div className="stat-box">
                <div>💼</div>
                <h2>94.5%</h2>
                <p>Placement Record</p>
              </div>
            </div>

            {/* MILESTONE HIGHLIGHT CARDS */}
            <div className="achievement-cards-grid">
              {achievementsList.map((item, idx) => (
                <div className="achievement-card" key={idx}>
                  <div className="achievement-card-top">
                    <div className="achievement-card-icon">{item.icon}</div>
                    <span className="achievement-card-tag">{item.tag}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

       {/* ================= PREMIUM PLACEMENT ================= */} {activeMenu === "placement" && ( <section id="placement" className="placement-section"> <div className="placement-container"> {/* ===================================================== HEADER ====================================================== */} <div className="placement-heading"> <span className="section-tag"> CAREER DEVELOPMENT </span> <h2> Building Careers. <br /> <span>Creating Opportunities.</span> </h2> <p> Our Training & Placement Cell prepares students with technical knowledge, aptitude skills, communication, interview confidence and industry-oriented capabilities. </p> </div> {/* ===================================================== PLACEMENT STATISTICS ====================================================== */} <div className="placement-stats"> <div className="placement-stat"> <div className="stat-number">174+</div> <div className="stat-label">Offers</div> <p>2022–23 placement report</p> </div> <div className="placement-stat"> <div className="stat-number">73</div> <div className="stat-label">Students Placed</div> <p>Across reported departments</p> </div> <div className="placement-stat"> <div className="stat-number">42+</div> <div className="stat-label">Recruiter Entries</div> <p>Listed in placement report</p> </div> <div className="placement-stat"> <div className="stat-number">9 LPA</div> <div className="stat-label">Highest Package</div> <p>Reported package entry</p> </div> </div> {/* ===================================================== HERO ====================================================== */} <div className="placement-hero"> <div className="placement-hero-image"> <img src="/placement-main.jpg" alt="SVCET Training and Placement" onError={(e) => { e.currentTarget.src = "/college-campus.png"; }} /> <div className="image-overlay"></div> <div className="hero-image-content"> <span> TRAINING & PLACEMENT CELL </span> <h3> From Classroom <br /> to Career. </h3> </div> </div> <div className="placement-hero-content"> <span className="mini-label"> OUR APPROACH </span> <h3> Placement is more than <span> an interview.</span> </h3> <p> The Training & Placement Cell focuses on long-term career readiness. Students receive structured preparation covering technical skills, aptitude, communication, professional behaviour and interview performance. </p> <div className="placement-points"> <div> <span>01</span> <p> <strong>Technical Readiness</strong> Domain knowledge, programming and emerging technology preparation. </p> </div> <div> <span>02</span> <p> <strong>Aptitude & Reasoning</strong> Quantitative aptitude, logical reasoning and analytical problem solving. </p> </div> <div> <span>03</span> <p> <strong>Communication Skills</strong> Group discussions, presentations and professional communication. </p> </div> <div> <span>04</span> <p> <strong>Interview Preparation</strong> Resume preparation, mock interviews and recruitment practice. </p> </div> </div> </div> </div> {/* ===================================================== CAREER PROGRAMS ====================================================== */} <div className="placement-program-heading"> <span className="section-tag"> CAREER PROGRAMS </span> <h3> Training Designed for <span> Industry Readiness.</span> </h3> <p> Students are guided through a structured development journey from foundational skills to recruitment readiness. </p> </div> <div className="placement-programs"> {/* TECHNICAL */} <div className="program-card"> <div className="program-number"> 01 </div> <div className="program-icon"> ⌁ </div> <h4> Technical Training </h4> <p> Technical preparation designed to strengthen programming, domain knowledge and problem-solving. </p> <ul> <li>Programming Skills</li> <li>Core Domain Training</li> <li>Problem Solving</li> <li>Emerging Technologies</li> </ul> </div> {/* APTITUDE */} <div className="program-card"> <div className="program-number"> 02 </div> <div className="program-icon"> ◈ </div> <h4> Aptitude Training </h4> <p> Regular practice in quantitative aptitude, logical reasoning and analytical skills. </p> <ul> <li>Quantitative Aptitude</li> <li>Logical Reasoning</li> <li>Data Interpretation</li> <li>Online Assessments</li> </ul> </div> {/* SOFT SKILLS */} <div className="program-card"> <div className="program-number"> 03 </div> <div className="program-icon"> ◎ </div> <h4> Soft Skills </h4> <p> Professional communication and interpersonal skills required for workplace success. </p> <ul> <li>Communication</li> <li>Group Discussion</li> <li>Presentation Skills</li> <li>Personality Development</li> </ul> </div> {/* MOCK INTERVIEW */} <div className="program-card"> <div className="program-number"> 04 </div> <div className="program-icon"> ↗ </div> <h4> Mock Interviews </h4> <p> Recruitment simulations that help students understand interview expectations. </p> <ul> <li>HR Interviews</li> <li>Technical Interviews</li> <li>Resume Review</li> <li>Feedback Sessions</li> </ul> </div> </div> {/* ===================================================== TRAINING MODULE ====================================================== */} <div className="training-module-section"> <div className="training-module-heading"> <span className="section-tag"> TRAINING MODULE </span> <h3> A structured journey from <span> first year to placement.</span> </h3> <p> Our skill enhancement and pre-placement training enables students to develop employable skills and industry-oriented knowledge progressively throughout their academic journey. </p> </div> {/* ================= FIRST YEAR ================= */} <div className="training-year-card"> <div className="training-year-number"> 01 </div> <div className="training-year-content"> <span className="training-year-label"> FOUNDATION </span> <h4> First Year </h4> <div className="training-list"> <div> <span>✓</span> <p> Basic English (speak, read & write) </p> </div> <div> <span>✓</span> <p> Verbal & Non-Verbal </p> </div> <div> <span>✓</span> <p> Spoken English course for mediocre & Tamil medium students </p> </div> </div> </div> </div> {/* ================= SECOND YEAR ================= */} <div className="training-year-card"> <div className="training-year-number"> 02 </div> <div className="training-year-content"> <span className="training-year-label"> SKILL DEVELOPMENT </span> <h4> Second Year </h4> <div className="training-list"> <div> <span>✓</span> <p> Intermediate English (speak, read & write) </p> </div> <div> <span>✓</span> <p> British English Course </p> </div> <div> <span>✓</span> <p> Aptitude problem solving skills - Basic </p> </div> <div> <span>✓</span> <p> Analytical & Reasoning </p> </div> </div> </div> </div> {/* ================= PRE-FINAL YEAR ================= */} <div className="training-year-card"> <div className="training-year-number"> 03 </div> <div className="training-year-content"> <span className="training-year-label"> CAREER PREPARATION </span> <h4> Pre-Final Year </h4> <div className="training-list"> <div> <span>✓</span> <p> Career Awareness sessions </p> </div> <div> <span>✓</span> <p> Soft Skills Training (Creativity, Motivation, Leadership, Group dynamics and Body Language) </p> </div> <div> <span>✓</span> <p> Aptitude Training (Analytical, Logical & Verbal reasoning skills) </p> </div> <div> <span>✓</span> <p> Mock Interviews (Tech & HR) by senior faculty from the respective department </p> </div> </div> </div> </div> {/* ================= FINAL YEAR ================= */} <div className="training-year-card training-final-card"> <div className="training-year-number"> 04 </div> <div className="training-year-content"> <span className="training-year-label"> PLACEMENT READINESS </span> <h4> Final Year </h4> <div className="training-list"> <div> <span>✓</span> <p> Training on Corporate question papers & Corporate Etiquette </p> </div> <div> <span>✓</span> <p> Interview Skills and Mock Interview </p> </div> <div> <span>✓</span> <p> Monthly tests on company questions </p> </div> <div> <span>✓</span> <p> Weekly Group discussions & Mock Interviews </p> </div> <div> <span>✓</span> <p> Technical Training on their core and in other areas like Programming fundamentals - C & C++, JAVA, Hardware, Networking, etc by our internal faculty </p> </div> </div> </div> </div> </div> {/* ===================================================== RECRUITMENT PROCESS ====================================================== */} <div className="recruitment-process"> <div className="process-intro"> <span className="section-tag"> RECRUITMENT JOURNEY </span> <h3> From preparation <span> to offer letter.</span> </h3> <p> Students are guided through the major stages of the recruitment journey. </p> </div> <div className="process-timeline"> <div className="process-step"> <span>01</span> <h4> Assessment </h4> <p> Evaluate technical and aptitude fundamentals. </p> </div> <div className="process-line"></div> <div className="process-step"> <span>02</span> <h4> Training </h4> <p> Structured technical and employability training. </p> </div> <div className="process-line"></div> <div className="process-step"> <span>03</span> <h4> Practice </h4> <p> Mock tests, GDs, interviews and resume preparation. </p> </div> <div className="process-line"></div> <div className="process-step"> <span>04</span> <h4> Recruitment </h4> <p> Campus drives and company selection processes. </p> </div> <div className="process-line"></div> <div className="process-step"> <span>05</span> <h4> Career </h4> <p> Students progress towards professional opportunities. </p> </div> </div> </div> {/* ===================================================== PHOTO GALLERY ====================================================== */} <div className="placement-gallery-heading"> <span className="section-tag"> PLACEMENT LIFE </span> <h3> Moments from our <span> career journey.</span> </h3> </div> <div className="placement-gallery"> <div className="gallery-item gallery-large"> <img src="/placement-1.jpg" alt="Campus Recruitment" onError={(e) => { e.currentTarget.src = "/college-campus.png"; }} /> <div className="gallery-caption"> <span>01</span> <strong> Campus Recruitment </strong> </div> </div> <div className="gallery-item"> <img src="/placement-2.jpg" alt="Career Training" onError={(e) => { e.currentTarget.src = "/college-campus.png"; }} /> <div className="gallery-caption"> <span>02</span> <strong> Career Training </strong> </div> </div> <div className="gallery-item"> <img src="/placement-3.jpg" alt="Interview Preparation" onError={(e) => { e.currentTarget.src = "/college-campus.png"; }} /> <div className="gallery-caption"> <span>03</span> <strong> Interview Preparation </strong> </div> </div> <div className="gallery-item"> <img src="/placement-4.jpg" alt="Industry Interaction" onError={(e) => { e.currentTarget.src = "/college-campus.png"; }} /> <div className="gallery-caption"> <span>04</span> <strong> Industry Interaction </strong> </div> </div> </div> {/* ===================================================== RECRUITERS ====================================================== */} <div className="recruiters-heading"> <span className="section-tag"> RECRUITERS </span> <h3> Companies that have <span> visited our campus.</span> </h3> <p> Selected recruiter names from the published SVCET placement information. </p> </div> <div className="company-grid"> {[ "TCS", "Sutherland", "Uplus Technology", "Health Watch", "Intellipaat", "JoyTech", "IDP", "CSS Corp", "Zifo RnD", "Profuture", "Chegg India", "Integra", "Lumina Datamatics", "Amphenol", "Omniconnect", "Thinksynq", "LSE Global", "Soft Solutions", "Gigamon", "Datalogics", "Hakuna Matata", "Net Axis IT", "Life Signs", "Devcare Solutions", "Pick ur Trail", "eSales", "Softcrylic", "Kumaran Systems", "Ippo Pay", "Pactron", "Atos", "Episource", "Deloitte", "Oneyes Technologies", "Flipkart", "Athena Health", "Faceprep", "Ergize Automation", "FastNex India", "Youngshin India" ].map((company, index) => ( <div className="company-card" key={company} > <span> {String(index + 1).padStart(2, "0")} </span> <strong> {company} </strong> <small> Campus Recruiter </small> </div> ))} </div> {/* ===================================================== TRAINING & PLACEMENT OFFICER ====================================================== */} <div className="placement-officer-section"> <div className="officer-heading"> <span className="section-tag"> TRAINING & PLACEMENT </span> <h3> Training and Placement <span> Officer Profile.</span> </h3> <p> Meet the team responsible for guiding students towards professional opportunities and career readiness. </p> </div> <div className="officer-profile-grid"> {/* MAIN OFFICER */} <div className="officer-card"> <div className="officer-card-top"> <span className="officer-role"> TRAINING & PLACEMENT OFFICER </span> <div className="officer-badge"> TPO </div> </div> <h4> Mr. Muralidharan Gopinathan </h4> <p className="officer-qualification"> M.Sc., M.B.A., HDASM </p> <div className="officer-contact"> <div> <span> CONTACT </span> <a href="tel:+918200740862"> +91 8200740862 </a> </div> <div> <span> E-MAIL </span> <a href="mailto:placement@sriventech.ac.in"> placement@sriventech.ac.in </a> </div> </div> </div> {/* ASSISTANT OFFICER */} <div className="officer-card"> <div className="officer-card-top"> <span className="officer-role"> ASSISTANT TRAINING & PLACEMENT OFFICER </span> <div className="officer-badge"> ATPO </div> </div> <h4> Dr. Varunkumar Veerapandian </h4> <p className="officer-qualification"> M.E., Ph.D </p> <div className="officer-contact"> <div> <span> CONTACT </span> <a href="tel:+919789391957"> +91 9789391957 </a> </div> <div> <span> E-MAIL </span> <a href="mailto:varunstructural@gmail.com"> varunstructural@gmail.com </a> </div> </div> </div> </div> </div> {/* ===================================================== COMMITTEE MEMBERS ====================================================== */} <div className="committee-section"> <div className="committee-heading"> <span className="section-tag"> PLACEMENT COMMITTEE </span> <h3> Committee <span> Members.</span> </h3> <p> Faculty members supporting the Training and Placement activities across different departments. </p> </div> <div className="committee-table-wrapper"> <table className="committee-table"> <thead> <tr> <th> S.NO </th> <th> NAME OF THE MEMBERS </th> <th> DESIGNATION </th> </tr> </thead> <tbody> <tr> <td>01</td> <td>Dr. S. Devi</td> <td>Principal</td> </tr> <tr> <td>02</td> <td>Dr. P. R. Senthil Rajan</td> <td>HOD / EEE</td> </tr> <tr> <td>03</td> <td>Mr. E. Murali</td> <td>AP / ECE</td> </tr> <tr> <td>04</td> <td>Mrs. S. Geetha</td> <td>AP / EEE</td> </tr> <tr> <td>05</td> <td>Mr. V. Jagadeesh</td> <td>AP / MECH</td> </tr> <tr> <td>06</td> <td>Mr. A. Senthil</td> <td>AP / CIVIL</td> </tr> <tr> <td>07</td> <td>Mrs. S. Sangeetha</td> <td>AP / MCA</td> </tr> <tr> <td>08</td> <td>Mrs. M. Hemalatha</td> <td>AP / MBA</td> </tr> <tr> <td>09</td> <td>Mr. B. Bharaneedharan</td> <td>AP / EEE</td> </tr> </tbody> </table> </div> </div> {/* ===================================================== CTA ====================================================== */} <div className="placement-cta"> <div> <span className="section-tag"> YOUR CAREER STARTS HERE </span> <h3> Prepare today. <span> Lead tomorrow.</span> </h3> <p> Build the skills, confidence and professional mindset required for your next opportunity. </p> </div> <button className="placement-cta-button" onClick={() => navigateTo("contact")} > Connect With Us <span>→</span> </button> </div> </div> </section> )}

        {/* ================= PREMIUM CONTACT ================= */}
{activeMenu === "contact" && (
  <section id="contact" className="premium-contact-section">

    {/* Background decoration */}
    <div className="contact-glow contact-glow-one"></div>
    <div className="contact-glow contact-glow-two"></div>

    <div className="contact-container">

      {/* ================= HEADER ================= */}
      <div className="contact-header">
        <span className="contact-badge">
          CONTACT
        </span>

        <h1>
          Get In <span>Touch</span>
        </h1>

        <p>
          We would love to hear from you. Reach out to SVCET
          for admissions, academics, student support and general enquiries.
        </p>
      </div>


      {/* ================= QUICK ACTIONS ================= */}
      <div className="quick-contact-grid">

        <a
          href="tel:04427664444"
          className="quick-contact-card"
        >
          <div className="quick-icon phone-icon">
            ☎
          </div>

          <div>
            <small>CALL US</small>
            <h3>044-27664444</h3>
            <p>College Office</p>
          </div>

          <span className="card-arrow">→</span>
        </a>


        <a
          href="mailto:principal@sriventech.ac.in"
          className="quick-contact-card"
        >
          <div className="quick-icon email-icon">
            ✉
          </div>

          <div>
            <small>EMAIL US</small>
            <h3>principal@sriventech.ac.in</h3>
            <p>Official College Contact</p>
          </div>

          <span className="card-arrow">→</span>
        </a>


        <a
          href="tel:+919176745678"
          className="quick-contact-card"
        >
          <div className="quick-icon mobile-icon">
            📱
          </div>

          <div>
            <small>MOBILE</small>
            <h3>+91 9176745678</h3>
            <p>Principal / Assistance</p>
          </div>

          <span className="card-arrow">→</span>
        </a>

      </div>


      {/* ================= MAIN CONTACT AREA ================= */}
      <div className="contact-main-grid">


        {/* ================= LEFT INFO ================= */}
        <div className="contact-info-panel">

          <div className="panel-heading">
            <span>01</span>
            <div>
              <small>COLLEGE INFORMATION</small>
              <h2>We're Here To Help</h2>
            </div>
          </div>


          {/* Address */}
          <div className="contact-info-item">

            <div className="info-icon">
              📍
            </div>

            <div>
              <span>VISIT US</span>

              <h3>College Campus</h3>

              <p>
                Sri Venkateswara College of Engineering
                and Technology
                <br />
                Thirupachur,
                <br />
                Thiruvallur – 631 203,
                <br />
                Tamil Nadu, India.
              </p>
            </div>

          </div>


          {/* Phone */}
          <div className="contact-info-item">

            <div className="info-icon">
              ☎
            </div>

            <div>
              <span>CALL US</span>

              <h3>College Office</h3>

              <a href="tel:04427664444">
                044-27664444
              </a>

              <a href="tel:+919176745678">
                +91 9176745678
              </a>
            </div>

          </div>


          {/* Email */}
          <div className="contact-info-item">

            <div className="info-icon">
              ✉
            </div>

            <div>
              <span>EMAIL</span>

              <h3>Official Support</h3>

              <a href="mailto:principal@sriventech.ac.in">
                principal@sriventech.ac.in
              </a>

              <a href="mailto:helpdesk@sriventech.ac.in">
                helpdesk@sriventech.ac.in
              </a>
            </div>

          </div>


          {/* Office Hours */}
          <div className="office-hours">

            <div className="hours-top">
              <div>
                <span>OFFICE HOURS</span>
                <h3>When can you reach us?</h3>
              </div>

              <div className="status-dot"></div>
            </div>

            <div className="hours-row">
              <span>Monday – Friday</span>
              <strong>9:00 AM – 5:00 PM</strong>
            </div>

            <div className="hours-row">
              <span>Saturday</span>
              <strong>9:00 AM – 1:00 PM</strong>
            </div>

            <div className="hours-row closed">
              <span>Sunday</span>
              <strong>Closed</strong>
            </div>

          </div>

        </div>


        {/* ================= RIGHT FORM ================= */}
        <div className="contact-form-panel">

          <div className="form-heading">
            <span>02</span>

            <div>
              <small>SEND AN ENQUIRY</small>
              <h2>How Can We Help?</h2>
            </div>
          </div>


          <form className="premium-contact-form">

            <div className="form-row">

              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              </div>


              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

            </div>


            <div className="form-row">

              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>


              <div className="form-group">
                <label>Department</label>

                <select defaultValue="">
                  <option value="" disabled>
                    Select department
                  </option>

                  <option>Admissions</option>
                  <option>Academic</option>
                  <option>Placement</option>
                  <option>Student Support</option>
                  <option>Administration</option>
                  <option>General Enquiry</option>
                </select>

              </div>

            </div>


            <div className="form-group">

              <label>Subject</label>

              <input
                type="text"
                placeholder="What is your enquiry about?"
              />

            </div>


            <div className="form-group">

              <label>Your Message</label>

              <textarea
                rows="5"
                placeholder="Write your message here..."
                required
              ></textarea>

            </div>


            <button
              type="submit"
              className="send-message-btn"
            >
              <span>Send Message</span>
              <span className="btn-arrow">→</span>
            </button>

          </form>

        </div>

      </div>


      {/* ================= SUPPORT CARDS ================= */}
      <div className="support-section">

        <div className="support-heading">

          <span>03</span>

          <div>
            <small>DIRECT SUPPORT</small>
            <h2>Need Immediate Assistance?</h2>
          </div>

        </div>


        <div className="support-grid">

          {/* Admissions */}
          <div className="support-card">

            <div className="support-card-icon">
              🎓
            </div>

            <div>
              <span>ADMISSIONS</span>

              <h3>Admission Enquiry</h3>

              <p>
                Get assistance regarding courses,
                eligibility and admission process.
              </p>

              <a href="mailto:principal@sriventech.ac.in">
                Contact Admissions →
              </a>
            </div>

          </div>


          {/* Student Helpdesk */}
          <div className="support-card">

            <div className="support-card-icon">
              💬
            </div>

            <div>
              <span>STUDENT SUPPORT</span>

              <h3>Online Helpdesk</h3>

              <p>
                Get support for academic and
                student-related issues.
              </p>

              <a href="mailto:helpdesk@sriventech.ac.in">
                Contact Helpdesk →
              </a>
            </div>

          </div>


          {/* Placement */}
          <div className="support-card">

            <div className="support-card-icon">
              💼
            </div>

            <div>
              <span>CAREER</span>

              <h3>Placement Cell</h3>

              <p>
                Connect with the placement team
                for career-related enquiries.
              </p>

              <a href="#placement">
                Visit Placement →
              </a>
            </div>

          </div>

        </div>

      </div>


      {/* ================= MAP + COLLEGE CARD ================= */}
      <div className="location-section">

        <div className="location-card">

          <div className="location-content">

            <span className="location-label">
              FIND US
            </span>

            <h2>
              Visit Our Campus
            </h2>

            <p>
              Thirupachur, Thiruvallur – 631 203,
              Tamil Nadu.
            </p>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Sri+Venkateswara+College+of+Engineering+and+Technology+Thirupachur"
              target="_blank"
              rel="noreferrer"
              className="direction-btn"
            >
              Get Directions
              <span>↗</span>
            </a>

          </div>


          <div className="map-preview">

            <div className="map-grid"></div>

            <div className="map-pin">
              <span>📍</span>
            </div>

            <div className="map-label">
              <strong>SVCET</strong>
              <small>Thirupachur</small>
            </div>

          </div>

        </div>

      </div>


      {/* ================= FOOTER CONTACT STRIP ================= */}
      <div className="contact-footer-strip">

        <div>
          <span>SVCET</span>
          <strong>
            Sri Venkateswara College of Engineering & Technology
          </strong>
        </div>

        <div className="footer-links">

          <a href="tel:04427664444">
            Call
          </a>

          <a href="mailto:principal@sriventech.ac.in">
            Email
          </a>

          <a
            href="https://www.sriventech.ac.in/"
            target="_blank"
            rel="noreferrer"
          >
            Website
          </a>

        </div>

      </div>

    </div>

  </section>
)}
        {/* ================= PORTAL (AFTER LOGIN) ================= */}
        {activeMenu === "portal" && (
          currentUser ? (
            currentUser.role === "college" ? (
              <AdminPortal user={currentUser} />
            ) : currentUser.role === "faculty" ? (
              <TeacherPortal user={currentUser} />
            ) : (
              <StudentPortal user={currentUser} />
            )
          ) : (
            <Login
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setActiveMenu("portal");
              }}
            />
          )
        )}

        {/* ================= LOGIN ================= */}
        {activeMenu === "login" && (
          <Login
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveMenu("portal");
            }}
          />
        )}

        {/* ================= FOOTER ================= */}
        <footer className="footer">
          <div className="footer-left">
            <img src="/college-logo.png" alt="College Logo" />
            <div>
              <h3>Sri Venkateswara College of Engineering and Technology</h3>
              <p>
                Empowering Students
                <span>|</span>
                Building Future Leaders
              </p>
            </div>
          </div>

          <div className="footer-right">

  <div className="social-icons">

    {/* FACEBOOK */}
    <a
      href="https://www.facebook.com/share/18K1Yr1ZTq/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="SVCET Facebook"
      className="social-icon facebook"
    >
      <FaFacebookF />
    </a>

    {/* INSTAGRAM */}
    <a
      href="https://www.instagram.com/svcetthirupachur?stkn=Ymp0dHlqdzQ1YzBt"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="SVCET Instagram"
      className="social-icon instagram"
    >
      <FaInstagram />
    </a>

    {/* YOUTUBE */}
    <a
      href="https://www.youtube.com/@svcet_thirupachur"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="SVCET YouTube"
      className="social-icon youtube"
    >
      <FaYoutube />
    </a>

  </div>

  <p>© 2026 SVCET. All Rights Reserved.</p>

</div>
        </footer>
      </main>
    </div>
  );
}

export default App;