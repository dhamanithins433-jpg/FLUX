import { useState } from "react";

import "./App.css";


function App() {

  const [activeMenu, setActiveMenu] =
    useState("home");


  // Navigation function
  const navigateTo = (page) => {
    setActiveMenu(page);
  };


  // Menu Data

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


  // Department Data

  const departments = [

    {
      icon: "💻",

      title:
        "Computer Science Engineering",

      description:
        "Learn programming, AI, cybersecurity and modern technologies."
    },

    {
      icon: "🖥️",

      title:
        "Information Technology",

      description:
        "Build strong knowledge in software and information systems."
    },

    {
      icon: "📡",

      title:
        "Electronics & Communication",

      description:
        "Explore electronics, communication systems and embedded technologies."
    },

    {
      icon: "⚡",

      title:
        "Electrical & Electronics",

      description:
        "Learn electrical systems, circuits and power technologies."
    },

    {
      icon: "⚙️",

      title:
        "Mechanical Engineering",

      description:
        "Explore design, manufacturing and mechanical technologies."
    },

    {
      icon: "🏢",

      title:
        "Civil Engineering",

      description:
        "Learn construction, infrastructure and structural engineering."
    }

  ];


  return (

    <div className="app">


      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">


        {/* COLLEGE LOGO */}

        <div className="sidebar-logo">

          <img
            src="/college-logo.png"
            alt="College Logo"
            
          />

          <h1>
            SVCET
          </h1>

          <p>
            College Portal
          </p>

        </div>



        {/* NAVIGATION MENU */}

        <nav className="navigation">

          {

            menuItems.map((item) => (

              <button

                key={item.id}

                className={
                  activeMenu === item.id
                    ? "nav-item active"
                    : "nav-item"
                }

                onClick={() =>
                  navigateTo(item.id)
                }

              >

                <span className="nav-icon">

                  {item.icon}

                </span>


                <span className="nav-text">

                  {item.name}

                </span>

              </button>

            ))

          }

        </nav>



        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-footer">

          <span>
            Learn
          </span>

          <span>
            |
          </span>

          <span>
            Grow
          </span>

          <span>
            |
          </span>

          <span>
            Succeed
          </span>

        </div>


      </aside>



      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">


        {/* ================= HEADER ================= */}

        <header className="top-header">


          <div className="header-left">


            <img
              src="/college-logo.png"
              alt="College Logo"
            />


            <div>

              <h1>
                SRI VENKATESWARA
              </h1>

              <p>
                College of Engineering and Technology
              </p>

            </div>


          </div>



          <div className="header-right">


            <p>
              An Autonomous Institution
            </p>


            <button className="hamburger">

              ☰

            </button>


          </div>


        </header>



        {/* ================= HOME ================= */}
        {activeMenu === "home" && (

        <section
          id="home"
          className="hero-section"
        >
        


          {/* HERO TEXT */}

          <div className="hero-content">


            <div className="hero-tag">

              <span>
                KNOWLEDGE
              </span>

              <span>|</span>

              <span>
                INNOVATION
              </span>

              <span>|</span>

              <span>
                EXCELLENCE
              </span>

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

              onClick={() =>
                navigateTo("courses")
              }

            >

              Explore Courses →

            </button>


          </div>



          {/* HERO IMAGE */}

          <div className="hero-image">


            <img

              src="/campus.jpg"

              alt="College Campus"

            />


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

        <section
          id="courses"
          className="courses-section"
        >


          <div className="section-header">


            <div>


              <span className="section-title">

                ACADEMICS

              </span>


              <h2>

                Our Departments

              </h2>


              <p>

                Explore our Engineering and Technology Programs

              </p>


            </div>



            <button
              className="view-course-button"
            >

              View All Courses →

            </button>


          </div>



          {/* DEPARTMENT CARDS */}

          <div className="department-grid">


            {

              departments.map(

                (department, index) => (

                  <div
                    className="department-card"
                    key={index}
                  >


                    <div className="department-icon">

                      {department.icon}

                    </div>



                    <h3>

                      {department.title}

                    </h3>



                    <p>

                      {department.description}

                    </p>


                  </div>

                )

              )

            }


          </div>


        </section>
        )}



        {/* ================= ACHIEVEMENTS ================= */}
        {activeMenu === "achievements" && (

        <section
          id="achievements"
          className="achievements-section"
        >


          <div className="achievement-heading">


            <span>
              EXCELLENCE
            </span>


            <h2>
              Our Achievements
            </h2>


            <p>
              Growing Together with Success
            </p>


          </div>



          <div className="stats-container">


            <div className="stat-box">

              <div>
                🎓
              </div>

              <h2>
                5000+
              </h2>

              <p>
                Students
              </p>

            </div>



            <div className="stat-box">

              <div>
                👨‍🏫
              </div>

              <h2>
                250+
              </h2>

              <p>
                Faculty Members
              </p>

            </div>



            <div className="stat-box">

              <div>
                🏢
              </div>

              <h2>
                10+
              </h2>

              <p>
                Departments
              </p>

            </div>



            <div className="stat-box">

              <div>
                🏆
              </div>

              <h2>
                100+
              </h2>

              <p>
                Achievements
              </p>

            </div>


          </div>


        </section>
        )}



        {/* ================= PLACEMENT ================= */}
        {activeMenu === "placement" && (

        <section
          id="placement"
          className="placement-section"
        >


          <div className="placement-left">


            <span className="small-heading">

              CAREER

            </span>


            <h2>

              Training & Placement

            </h2>


            <p>

              Building Successful Careers

            </p>



            <ul>

              <li>
                ✓ Technical Training
              </li>

              <li>
                ✓ Aptitude Training
              </li>

              <li>
                ✓ Mock Interviews
              </li>

              <li>
                ✓ Campus Recruitment
              </li>

            </ul>


          </div>



          <div className="placement-right">


            <div className="placement-card">


              <span>
                👥
              </span>


              <div>

                <h2>
                  90%
                </h2>

                <p>
                  Placement Rate
                </p>

              </div>


            </div>



            <div className="placement-card">


              <span>
                ₹
              </span>


              <div>

                <h2>
                  8 LPA
                </h2>

                <p>
                  Highest Package
                </p>

              </div>


            </div>



            <div className="placement-card">


              <span>
                🏢
              </span>


              <div>

                <h2>
                  100+
                </h2>

                <p>
                  Recruiters
                </p>

              </div>


            </div>


          </div>


        </section>
        )}



        {/* ================= CONTACT ================= */}
        {activeMenu === "contact" && (

        <section
          id="contact"
          className="contact-section"
        >


          <div className="contact-left">


            <span className="small-heading">

              CONTACT

            </span>


            <h2>
              Get In Touch
            </h2>


            <p>
              We Would Love to Hear From You
            </p>



            <div className="contact-details">


              <div>

                <span>
                  📍
                </span>

                <p>

                  Thirupachur,

                  <br />

                  Thiruvallur TK,

                  <br />

                  Tamil Nadu - 631203

                </p>

              </div>



              <div>

                <span>
                  📞
                </span>

                <p>
                  +91 XXXXX XXXXX
                </p>

              </div>



              <div>

                <span>
                  ✉️
                </span>

                <p>
                  info@svcet.edu.in
                </p>

              </div>


            </div>



            <button className="message-button">

              Send Message →

            </button>


          </div>



          {/* MAP */}

          <div className="map-box">

            <div className="map-pin">

              📍

            </div>

          </div>


        </section>
        )}



        {/* ================= FOOTER ================= */}

        <footer className="footer">


          <div className="footer-left">


            <img
              src="/college-logo.png"
              alt="College Logo"
            />


            <div>


              <h3>

                Sri Venkateswara College of
                Engineering and Technology

              </h3>


              <p>

                Empowering Students

                <span>|</span>

                Building Future Leaders

              </p>


            </div>


          </div>



          <div className="footer-right">


            <div className="social-icons">

              <span>f</span>

              <span>◎</span>

              <span>in</span>

              <span>▶</span>

            </div>


            <p>

              © 2026 SVCET.
              All Rights Reserved.

            </p>


          </div>


        </footer>


      </main>


    </div>

  );

}


export default App;