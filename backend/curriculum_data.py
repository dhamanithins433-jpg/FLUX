"""
Curriculum Catalog & Data Seeder for College Portal.
Provides verified Anna University CBCS syllabi, subjects, regulations, and study materials
for all undergraduate and postgraduate academic programs.
"""

CURRICULUM_DATA = [
    # 1. Information Technology (IT)
    {
        "code": "IT",
        "name": "Information Technology (IT)",
        "department": "Information Technology",
        "description": "Building robust enterprise software, full-stack systems, cloud architectures, web development, and DevOps pipelines under Anna University CBCS curriculum.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3256", "Physics for Information Science", 2, 3),
            ("BE3251", "Basic Electrical and Electronics Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("CS3251", "Programming in C", 2, 3),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3354", "Discrete Mathematics", 3, 4),
            ("CS3351", "Digital Principles and Computer Organization", 3, 4),
            ("CS3352", "Foundations of Data Science", 3, 3),
            ("CS3301", "Data Structures", 3, 3),
            ("IT3301", "Object Oriented Programming & Design Patterns", 3, 3),
            ("CS3452", "Theory of Computation", 4, 3),
            ("IT3401", "Web Essentials & Technologies", 4, 3),
            ("CS3492", "Database Management Systems", 4, 3),
            ("CS3401", "Design and Analysis of Algorithms", 4, 4),
            ("CS3451", "Operating Systems", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            ("CS3591", "Computer Networks", 5, 4),
            ("IT3501", "Full Stack Web Development", 5, 4),
            ("CS3551", "Distributed Computing Systems", 5, 3),
            ("CCS334", "Big Data Analytics", 5, 3),
            ("CB3491", "Cryptography and Network Security", 5, 3),
            ("IT3601", "Mobile Computing & Application Architecture", 6, 3),
            ("CS3691", "Embedded Systems and IoT", 6, 4),
            ("CCS338", "Computer Vision and Image Processing", 6, 3),
            ("CCS346", "Cloud Computing & DevOps", 6, 3),
            ("GE3791", "Human Values and Professional Ethics", 7, 2),
            ("GE3751", "Principles of Management", 7, 3),
            ("IT3701", "High Performance & Parallel Computing", 7, 3),
            ("IT3711", "Summer Internship / Industry Project", 7, 2),
            ("IT3811", "Project Work / Capstone Internship", 8, 10),
            ("CCS370", "Quantum Computing & Quantum Information", 8, 3)
        ],
        "materials": [
            {
                "subject_code": "IT3401",
                "items": [
                    ("Anna University Regulation 2021 B.Tech IT Official Syllabus (IT3401)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.Tech.IT.pdf", "Anna University CAC", "2021-26"),
                    ("Unit 1: HTML5, CSS3, DOM & Responsive Web Principles", "Lecture Notes", "Unit 1", "https://www.brainkart.com/subject/Web-Technology_301/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 2: Client-Side Scripting, JavaScript & ES6 Standards", "Lecture Notes", "Unit 2", "https://www.brainkart.com/subject/Web-Technology_301/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 3: Server-Side Programming, Node.js and Express Framework", "Lecture Notes", "Unit 3", "https://www.brainkart.com/subject/Web-Technology_301/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 4: Database Integration, RESTful API Architecture & JSON", "Lecture Notes", "Unit 4", "https://www.brainkart.com/subject/Web-Technology_301/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 5: Web Security, HTTPS, OAuth 2.0 & Cloud Deployment", "Lecture Notes", "Unit 5", "https://www.brainkart.com/subject/Web-Technology_301/", "BrainKart Faculty Archive", "2024"),
                    ("IT3401 Unit-Wise 2-Mark & 16-Mark Question Bank with Solved Answers", "Important Questions", "All Units", "https://www.brainkart.com/subject/Web-Technology_301/", "Anna University Faculty Portal", "2024"),
                    ("Comprehensive Modern Web Development Guide & References", "Normal Notes", "All Units", "https://developer.mozilla.org/en-US/docs/Learn", "MDN Web Docs", "2024"),
                    ("Anna University End-Semester Previous Examination Papers (2022-2024)", "Question Paper", "All Units", "https://www.brainkart.com/subject/Web-Technology_301/", "BrainKart Question Archive", "2024"),
                    ("Full Stack Web Development Complete Video Course", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w", "CodeWithHarry (YouTube)", "2024"),
                    ("NPTEL IIT Kharagpur: Internet Technology & Web Services Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/106105084", "NPTEL Ministry of Education", "2023")
                ]
            },
            {
                "subject_code": "IT3501",
                "items": [
                    ("Anna University Regulation 2021 B.Tech IT Syllabus (IT3501)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.Tech.IT.pdf", "Anna University CAC", "2021-26"),
                    ("Full Stack Development Masterclass: React, Node, Express & MongoDB", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP", "Traversy Media (YouTube)", "2024"),
                    ("Full Stack Web Development & Microservices Comprehensive Notes", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/web-development/", "GeeksforGeeks Web", "2024"),
                    ("NPTEL Web Development & Cloud Services Video Series", "Video Lecture", "All Units", "https://nptel.ac.in/courses/106105084", "NPTEL", "2023")
                ]
            }
        ]
    },

    # 2. Electronics & Communication Engineering (ECE)
    {
        "code": "ECE",
        "name": "Electronics & Communication Engineering (ECE)",
        "department": "Electronics & Communication",
        "description": "Master VLSI chip design, embedded microcontrollers, satellite communications, digital signal processing, and IoT sensor systems under Anna University curriculum.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3254", "Physics for Electronics Engineering", 2, 3),
            ("BE3254", "Electrical and Instrumentation Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3355", "Random Processes and Linear Algebra", 3, 4),
            ("EC3354", "Signals and Systems", 3, 4),
            ("EC3353", "Electronic Devices and Circuits", 3, 3),
            ("EC3351", "Control Systems", 3, 3),
            ("EC3352", "Digital Systems Design", 3, 4),
            ("EC3452", "Electromagnetic Fields", 4, 3),
            ("EC3401", "Networks and Security", 4, 3),
            ("EC3451", "Linear Integrated Circuits", 4, 3),
            ("EC3492", "Digital Signal Processing", 4, 4),
            ("EC3491", "Communication Systems", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            ("EC3501", "Wireless Communication", 5, 4),
            ("EC3552", "VLSI and Chip Design", 5, 4),
            ("EC3551", "Transmission Lines and RF Systems", 5, 3),
            ("CEC331", "Optical Communication", 5, 3),
            ("ET3491", "Embedded Systems and IOT Design", 6, 4),
            ("CS3491", "Artificial Intelligence and Machine Learning", 6, 4),
            ("CEC341", "Antenna and Microwave Engineering", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("GE3751", "Principles of Management", 7, 3),
            ("CEC352", "Satellite Communication & Radar Systems", 7, 3),
            ("EC3711", "Summer Internship / Industrial Training", 7, 2),
            ("EC3811", "Project Work / Capstone Internship", 8, 10)
        ],
        "materials": [
            {
                "subject_code": "EC3354",
                "items": [
                    ("Anna University Regulation 2021 B.E. ECE Official Syllabus (EC3354)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/ECE/B.E.ECE.pdf", "Anna University CAC", "2021-26"),
                    ("Unit 1: Classification of Continuous and Discrete Time Signals", "Lecture Notes", "Unit 1", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 2: Fourier Analysis and Continuous Time LTI Systems", "Lecture Notes", "Unit 2", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 3: Laplace Transform and State Variable Analysis", "Lecture Notes", "Unit 3", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 4: Z-Transform and Discrete-Time LTI Analysis", "Lecture Notes", "Unit 4", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 5: Discrete Fourier Transform (DFT) and FFT Algorithms", "Lecture Notes", "Unit 5", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "BrainKart Faculty Archive", "2024"),
                    ("EC3354 Comprehensive Question Bank with Solved Numerical Problems", "Important Questions", "All Units", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "ECE Faculty Solved Bank", "2024"),
                    ("Signals and Systems Complete Video Lecture Series", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhG6s3jYIU48CqsT5pqU0Ec", "Neso Academy (YouTube)", "2023"),
                    ("NPTEL IIT Madras: Principles of Signals and Systems Online Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/108106163", "NPTEL Ministry of Education", "2023"),
                    ("Anna University Previous Year Question Paper Bank (2022-2024)", "Question Paper", "All Units", "https://www.brainkart.com/subject/Signals-and-Systems_230/", "BrainKart Archive", "2024")
                ]
            },
            {
                "subject_code": "EC3552",
                "items": [
                    ("Anna University Regulation 2021 B.E. ECE Syllabus (EC3552)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/ECE/B.E.ECE.pdf", "Anna University CAC", "2021-26"),
                    ("VLSI Design and CMOS Circuit Simulation Full Video Course", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiHp83m3fCO2iPmsNW_iO72g", "Gate Smashers (YouTube)", "2023"),
                    ("CMOS VLSI Technology & Digital Integrated Circuits Notes", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/vlsi-design-tutorial/", "GeeksforGeeks", "2024"),
                    ("NPTEL IIT Kharagpur: VLSI Design Verification and Test", "Useful Resources", "All Units", "https://nptel.ac.in/courses/106105165", "NPTEL", "2023")
                ]
            }
        ]
    },

    # 3. Electrical & Electronics Engineering (EEE)
    {
        "code": "EEE",
        "name": "Electrical & Electronics Engineering (EEE)",
        "department": "Electrical & Electronics",
        "description": "Explore power electronics, smart electric grid systems, renewable solar/wind energy, electric vehicle (EV) powertrains, and electrical machine design.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3258", "Physics for Electrical Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("EE3251", "Electric Circuit Analysis", 2, 4),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3303", "Probability and Complex Functions", 3, 4),
            ("EE3301", "Electromagnetic Fields", 3, 3),
            ("EE3302", "Digital Logic Circuits", 3, 3),
            ("EE3303", "Electrical Machines - I", 3, 3),
            ("EC3301", "Electron Devices and Circuits", 3, 3),
            ("EE3401", "Electrical Machines - II", 4, 3),
            ("EE3402", "Transmission and Distribution", 4, 3),
            ("EE3403", "Linear Integrated Circuits and Applications", 4, 3),
            ("EE3404", "Measurements and Instrumentation", 4, 3),
            ("EE3405", "Power Electronics", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            ("EE3501", "Power System Analysis", 5, 4),
            ("EE3502", "Microprocessors and Microcontrollers", 5, 4),
            ("EE3503", "Control Systems", 5, 3),
            ("CEE331", "High Voltage Engineering", 5, 3),
            ("EE3601", "Protection and Switchgear", 6, 3),
            ("EE3602", "Power System Operation and Control", 6, 3),
            ("CS3391", "Object Oriented Programming", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("GE3751", "Principles of Management", 7, 3),
            ("EE3701", "Electric Vehicle Technology and Smart Grids", 7, 3),
            ("EE3711", "Summer Internship / Industrial Training", 7, 2),
            ("EE3811", "Project Work / Capstone Internship", 8, 10)
        ],
        "materials": [
            {
                "subject_code": "EE3405",
                "items": [
                    ("Anna University Regulation 2021 B.E. EEE Official Syllabus (EE3405)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/EEE/B.E.EEE.pdf", "Anna University CAC", "2021-26"),
                    ("Unit 1: Power Semiconductor Switching Devices (SCR, MOSFET, IGBT)", "Lecture Notes", "Unit 1", "https://www.brainkart.com/subject/Power-Electronics_205/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 2: Phase-Controlled Rectifiers and AC to DC Converters", "Lecture Notes", "Unit 2", "https://www.brainkart.com/subject/Power-Electronics_205/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 3: DC to DC Choppers & Switch Mode Power Supplies (SMPS)", "Lecture Notes", "Unit 3", "https://www.brainkart.com/subject/Power-Electronics_205/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 4: Inverters, PWM Techniques & Resonant Converters", "Lecture Notes", "Unit 4", "https://www.brainkart.com/subject/Power-Electronics_205/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 5: AC Voltage Controllers and Cycloconverters", "Lecture Notes", "Unit 5", "https://www.brainkart.com/subject/Power-Electronics_205/", "BrainKart Faculty Archive", "2024"),
                    ("Power Electronics Complete Course with Solved Problems", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYzAblKMTeIdQpy", "Neso Academy (YouTube)", "2023"),
                    ("NPTEL IIT Delhi: Fundamental Power Electronics Lecture Series", "Useful Resources", "All Units", "https://nptel.ac.in/courses/108102145", "NPTEL Ministry of Education", "2023"),
                    ("EE3405 2-Mark and 13/16-Mark University Question Bank with Answers", "Important Questions", "All Units", "https://www.brainkart.com/subject/Power-Electronics_205/", "EEE Faculty Bank", "2024"),
                    ("Anna University Past End-Semester Examination Papers (2022-2024)", "Question Paper", "All Units", "https://www.brainkart.com/subject/Power-Electronics_205/", "BrainKart Archive", "2024")
                ]
            }
        ]
    },

    # 4. Mechanical Engineering (MECH)
    {
        "code": "MECH",
        "name": "Mechanical Engineering (MECH)",
        "department": "Mechanical Engineering",
        "description": "Explore robotics, automation, thermal power systems, fluid dynamics, CAD/CAM modeling, finite element analysis, and modern Industry 4.0 manufacturing.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3251", "Materials Science", 2, 3),
            ("BE3251", "Basic Electrical and Electronics Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3351", "Transforms and Partial Differential Equations", 3, 4),
            ("ME3351", "Engineering Mechanics", 3, 4),
            ("ME3391", "Fluid Mechanics and Machinery", 3, 4),
            ("ME3392", "Engineering Materials and Metallurgy", 3, 3),
            ("ME3393", "Manufacturing Processes", 3, 3),
            ("ME3491", "Theory of Machines", 4, 3),
            ("ME3492", "Thermal Engineering - I", 4, 4),
            ("ME3493", "Manufacturing Technology", 4, 3),
            ("ME3451", "Mechanics of Materials", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            ("ME3591", "Design of Machine Elements", 5, 4),
            ("ME3592", "Metrology and Measurements", 5, 3),
            ("ME3593", "Thermal Engineering - II", 5, 4),
            ("CME331", "Power Plant Engineering", 5, 3),
            ("ME3691", "Heat and Mass Transfer", 6, 4),
            ("ME3692", "Additive Manufacturing and 3D Printing", 6, 3),
            ("ME3693", "Computer Aided Design and Manufacturing (CAD/CAM)", 6, 4),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("ME3791", "Mechatronics and IoT in Automation", 7, 3),
            ("ME3792", "Industrial Robotics and Automation", 7, 3),
            ("ME3711", "Industrial Internship / Summer Training", 7, 2),
            ("ME3811", "Project Work / Capstone Internship", 8, 10)
        ],
        "materials": [
            {
                "subject_code": "ME3391",
                "items": [
                    ("Anna University Regulation 2021 B.E. MECH Syllabus (ME3391)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/Mech/B.E.Mech.pdf", "Anna University CAC", "2021-26"),
                    ("Unit 1: Fluid Properties, Hydrostatic Forces & Fluid Kinematics", "Lecture Notes", "Unit 1", "https://www.brainkart.com/subject/Fluid-Mechanics-and-Machinery_180/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 2: Fluid Dynamics, Bernoulli Equation & Boundary Layer Theory", "Lecture Notes", "Unit 2", "https://www.brainkart.com/subject/Fluid-Mechanics-and-Machinery_180/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 3: Dimensional Analysis, Similitude & Pipe Flow Hydraulics", "Lecture Notes", "Unit 3", "https://www.brainkart.com/subject/Fluid-Mechanics-and-Machinery_180/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 4: Hydraulic Turbines (Pelton, Francis, Kaplan & Performance)", "Lecture Notes", "Unit 4", "https://www.brainkart.com/subject/Fluid-Mechanics-and-Machinery_180/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 5: Centrifugal and Reciprocating Pumps Analysis", "Lecture Notes", "Unit 5", "https://www.brainkart.com/subject/Fluid-Mechanics-and-Machinery_180/", "BrainKart Faculty Archive", "2024"),
                    ("Fluid Mechanics and Machinery Video Lectures Series", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PL9RcWoqXmzaKeW6g8nQGvG_Q4N7Qc57Cg", "Learn Engineering / Lesics", "2023"),
                    ("NPTEL IIT Madras: Fluid Mechanics and Machinery Online Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/112105171", "NPTEL Ministry of Education", "2023"),
                    ("ME3391 Unit-Wise 2-Mark and Solved Numerical Problems", "Important Questions", "All Units", "https://www.brainkart.com/subject/Fluid-Mechanics-and-Machinery_180/", "MECH Faculty Bank", "2024")
                ]
            }
        ]
    },

    # 5. Civil Engineering (CIVIL)
    {
        "code": "CIVIL",
        "name": "Civil Engineering (CIVIL)",
        "department": "Civil Engineering",
        "description": "Design smart infrastructure, structural analysis, earthquake engineering, sustainable green construction, and modern GIS geoinformatics.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3201", "Physics for Civil Engineering", 2, 3),
            ("BE3252", "Basic Electrical, Electronics and Instrumentation Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3351", "Transforms and Partial Differential Equations", 3, 4),
            ("CE3301", "Fluid Mechanics", 3, 3),
            ("CE3302", "Construction Materials and Technology", 3, 3),
            ("CE3303", "Water Supply and Wastewater Engineering", 3, 4),
            ("CE3351", "Surveying and Levelling", 3, 4),
            ("CE3401", "Applied Hydraulics Engineering", 4, 3),
            ("CE3402", "Strength of Materials", 4, 4),
            ("CE3403", "Concrete Technology", 4, 3),
            ("CE3404", "Soil Mechanics", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            ("CE3501", "Design of Reinforced Concrete Structural Elements", 5, 4),
            ("CE3502", "Structural Analysis - I", 5, 3),
            ("CE3503", "Foundation Engineering", 5, 3),
            ("CE3504", "Highway and Railway Engineering", 5, 3),
            ("CE3601", "Design of Steel Structural Elements", 6, 4),
            ("CE3602", "Structural Analysis - II", 6, 3),
            ("CE3603", "Estimation, Costing and Valuation Engineering", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("CE3701", "Prestressed Concrete Structures", 7, 3),
            ("CE3702", "Construction Planning and Project Management", 7, 3),
            ("CE3711", "Summer Internship / Survey Camp", 7, 2),
            ("CE3811", "Project Work / Capstone Internship", 8, 10)
        ],
        "materials": [
            {
                "subject_code": "CE3402",
                "items": [
                    ("Anna University Regulation 2021 B.E. CIVIL Syllabus (CE3402)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/Civil/B.E.Civil.pdf", "Anna University CAC", "2021-26"),
                    ("Unit 1: Stress, Strain, Elastic Constants & Mohr Circle Analysis", "Lecture Notes", "Unit 1", "https://www.brainkart.com/subject/Strength-of-Materials_150/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 2: Shear Force and Bending Moment in Beams", "Lecture Notes", "Unit 2", "https://www.brainkart.com/subject/Strength-of-Materials_150/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 3: Torsion of Circular Shafts and Springs", "Lecture Notes", "Unit 3", "https://www.brainkart.com/subject/Strength-of-Materials_150/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 4: Deflection of Beams (Macaulay and Conjugate Beam Method)", "Lecture Notes", "Unit 4", "https://www.brainkart.com/subject/Strength-of-Materials_150/", "BrainKart Faculty Archive", "2024"),
                    ("Unit 5: Thin and Thick Cylinders, Columns and Struts (Euler Theory)", "Lecture Notes", "Unit 5", "https://www.brainkart.com/subject/Strength-of-Materials_150/", "BrainKart Faculty Archive", "2024"),
                    ("Strength of Materials Complete Video Lecture Series", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhz2eO4X2VbE9_tS2V_F8tU", "Neso Academy (YouTube)", "2023"),
                    ("NPTEL IIT Roorkee: Strength of Materials Mechanics Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/105107160", "NPTEL Ministry of Education", "2023"),
                    ("CE3402 Solved Numerical Question Bank and Model Exam Papers", "Important Questions", "All Units", "https://www.brainkart.com/subject/Strength-of-Materials_150/", "CIVIL Faculty Bank", "2024")
                ]
            }
        ]
    },

    # 6. Artificial Intelligence & Data Science (AIDS)
    {
        "code": "AIDS",
        "name": "Artificial Intelligence & Data Science (AIDS)",
        "department": "Artificial Intelligence and Data Science",
        "description": "Master machine learning algorithms, deep neural architectures, computer vision, natural language processing (NLP), and big data analytics systems.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3256", "Physics for Information Science", 2, 3),
            ("BE3251", "Basic Electrical and Electronics Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("CS3251", "Programming in C", 2, 3),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3354", "Discrete Mathematics", 3, 4),
            ("CS3351", "Digital Principles and Computer Organization", 3, 4),
            ("AD3391", "Database Design and Management", 3, 3),
            ("CS3301", "Data Structures", 3, 3),
            ("AD3351", "Design and Analysis of Algorithms", 3, 4),
            ("MA3391", "Probability and Statistics", 4, 4),
            ("AL3452", "Operating Systems", 4, 3),
            ("AL3451", "Machine Learning", 4, 4),
            ("AD3491", "Fundamentals of Data Science", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            ("CS3591", "Computer Networks", 5, 4),
            ("AD3501", "Deep Learning", 5, 4),
            ("CW3551", "Big Data Technologies", 5, 3),
            ("CCS338", "Computer Vision", 5, 3),
            ("AD3601", "Natural Language Processing", 6, 3),
            ("CS3691", "Embedded Systems and IoT", 6, 4),
            ("CCS346", "Cloud Computing & MLOps", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("GE3751", "Principles of Management", 7, 3),
            ("AD3701", "AI in Healthcare and Business Analytics", 7, 3),
            ("AD3711", "Summer Internship / Research Project", 7, 2),
            ("AD3811", "Project Work / Capstone Internship", 8, 10)
        ],
        "materials": [
            {
                "subject_code": "AL3451",
                "items": [
                    ("Anna University Regulation 2021 B.Tech AIDS Official Syllabus (AL3451)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.Tech.AI_DS.pdf", "Anna University CAC", "2021-26"),
                    ("Unit 1: Supervised Learning, Regression & Classification Fundamentals", "Lecture Notes", "Unit 1", "https://www.geeksforgeeks.org/machine-learning/", "GeeksforGeeks Machine Learning", "2024"),
                    ("Unit 2: Decision Trees, Ensemble Methods, Random Forest & Boosting", "Lecture Notes", "Unit 2", "https://www.geeksforgeeks.org/machine-learning/", "GeeksforGeeks Machine Learning", "2024"),
                    ("Unit 3: Support Vector Machines (SVM) & Kernel Methods", "Lecture Notes", "Unit 3", "https://www.geeksforgeeks.org/machine-learning/", "GeeksforGeeks Machine Learning", "2024"),
                    ("Unit 4: Unsupervised Learning, Clustering (K-Means, DBSCAN) & PCA", "Lecture Notes", "Unit 4", "https://www.geeksforgeeks.org/machine-learning/", "GeeksforGeeks Machine Learning", "2024"),
                    ("Unit 5: Neural Networks, Perceptron & Introduction to Deep Learning", "Lecture Notes", "Unit 5", "https://www.geeksforgeeks.org/machine-learning/", "GeeksforGeeks Machine Learning", "2024"),
                    ("Machine Learning Full Course with Hands-on Python", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe", "Krish Naik (YouTube)", "2024"),
                    ("NPTEL IIT Madras: Data Science for Engineers Online Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/106106179", "NPTEL Ministry of Education", "2023"),
                    ("AL3451 Unit-Wise 2-Mark Questions with Solved Numerical Problems", "Important Questions", "All Units", "https://www.brainkart.com/subject/Machine-Learning_401/", "AIDS Faculty Bank", "2024")
                ]
            }
        ]
    },

    # 7. CS & Business Systems (CSBS)
    {
        "code": "CSBS",
        "name": "CS & Business Systems (CSBS)",
        "department": "CS & Business Systems",
        "description": "TCS-curated academic curriculum blending digital computing technologies with enterprise finance, business strategy, and computational business analytics.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3256", "Physics for Information Science", 2, 3),
            ("BE3251", "Basic Electrical and Electronics Engineering", 2, 3),
            ("CS3251", "Programming in C", 2, 3),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            ("MA3354", "Discrete Mathematics", 3, 4),
            ("CB3301", "Computational Statistics", 3, 4),
            ("CS3301", "Data Structures", 3, 3),
            ("CS3391", "Object Oriented Programming", 3, 3),
            ("CB3401", "Introduction to Innovation & Design Thinking", 4, 3),
            ("CS3492", "Database Management Systems", 4, 3),
            ("CS3401", "Algorithms", 4, 4),
            ("CS3451", "Operating Systems", 4, 3),
            ("CB3491", "Cryptography and Network Security", 5, 3),
            ("CS3591", "Computer Networks", 5, 4),
            ("CB3501", "Financial Management and Analytics", 5, 3),
            ("CB3601", "Enterprise Cloud Systems and IT Operations", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("CB3701", "Conversational AI and Business Intelligence", 7, 3),
            ("CB3811", "Project Work / Corporate Internship", 8, 10)
        ],
        "materials": []
    },

    # 8. Cyber Security & Forensics (CYBER)
    {
        "code": "CYBER",
        "name": "Cyber Security & Forensics",
        "department": "Cyber Security & Forensics",
        "description": "Specialized defense curriculum in ethical hacking, applied cryptography, threat intelligence, cloud security, and digital forensics investigations.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3256", "Physics for Information Science", 2, 3),
            ("CS3251", "Programming in C", 2, 3),
            ("GE3252", "Tamils and Technology", 2, 1),
            ("MA3354", "Discrete Mathematics", 3, 4),
            ("CS3301", "Data Structures", 3, 3),
            ("CY3301", "Foundations of Cyber Security", 3, 3),
            ("CS3451", "Operating Systems", 4, 3),
            ("CS3492", "Database Management Systems", 4, 3),
            ("CY3401", "Digital Forensics and Incident Response", 4, 4),
            ("CB3491", "Cryptography and Network Security", 5, 3),
            ("CY3501", "Ethical Hacking and Penetration Testing", 5, 4),
            ("CY3601", "Cloud and Application Security", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("CY3701", "Cyber Threat Intelligence & SOC Analysis", 7, 3),
            ("CY3811", "Capstone Project / Security Internship", 8, 10)
        ],
        "materials": []
    },

    # 9. Biomedical & Biotechnology (BME)
    {
        "code": "BME",
        "name": "Biomedical & Biotechnology",
        "department": "Biomedical & Biotechnology",
        "description": "Cross-disciplinary engineering blending biological sensors, biomedical instrumentation, medical imaging, bioinformatics, and healthcare artificial intelligence.",
        "subjects_r2021": [
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("BM3251", "Human Anatomy and Physiology", 2, 3),
            ("EE3251", "Electric Circuit Analysis", 2, 4),
            ("BM3301", "Biomedical Sensors and Transducers", 3, 3),
            ("EC3354", "Signals and Systems", 3, 4),
            ("BM3401", "Medical Physics and Radiological Imaging", 4, 3),
            ("BM3402", "Biomedical Signal Processing", 4, 4),
            ("BM3501", "Diagnostic and Therapeutic Equipment", 5, 4),
            ("BM3601", "Biomaterials and Tissue Engineering", 6, 3),
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("BM3701", "Artificial Intelligence in Healthcare", 7, 3),
            ("BM3811", "Project Work / Hospital Internship", 8, 10)
        ],
        "materials": []
    },

    # 10. M.E. Computer Science (PG) (ME-CSE)
    {
        "code": "ME-CSE",
        "name": "M.E. Computer Science (PG)",
        "department": "M.E. Computer Science (PG)",
        "description": "Postgraduate advanced research program in distributed computing, high-performance algorithms, AI architectures, and cutting-edge software systems.",
        "subjects_r2021": [
            ("CP4151", "Advanced Data Structures and Algorithms", 1, 4),
            ("CP4152", "Database Technologies & Distributed Stores", 1, 3),
            ("CP4153", "Advanced Operating Systems & Virtualization", 1, 3),
            ("CP4154", "Research Methodology and IPR", 1, 2),
            ("CP4251", "Cloud Computing Technologies and Microservices", 2, 4),
            ("CP4252", "Machine Learning Techniques and Applications", 2, 3),
            ("CP4253", "Big Data Analytics and Mining", 2, 3),
            ("CP4351", "Industrial Project / Research Phase - I", 3, 6),
            ("CP4451", "Project Work Phase - II / Master Thesis", 4, 12)
        ],
        "materials": []
    },

    # 11. Master of Business Administration (MBA)
    {
        "code": "MBA",
        "name": "Master of Business Administration (MBA)",
        "department": "Master of Business Administration (MBA)",
        "description": "Premier executive management curriculum offering specializations in Financial Engineering, Human Resource Strategy, Digital Marketing, and Operations Management.",
        "subjects_r2021": [
            ("BA4101", "Statistics for Management", 1, 4),
            ("BA4102", "Management Concepts and Organizational Behavior", 1, 3),
            ("BA4103", "Managerial Economics", 1, 3),
            ("BA4104", "Accounting for Decision Making", 1, 4),
            ("BA4201", "Financial Management", 2, 4),
            ("BA4202", "Marketing Management", 2, 3),
            ("BA4203", "Human Resource Management", 2, 3),
            ("BA4204", "Operations Management", 2, 3),
            ("BA4301", "Strategic Management and Corporate Governance", 3, 3),
            ("BA4302", "International Business and Global Strategy", 3, 3),
            ("BA4401", "Capstone Project Work / Industry Internship", 4, 12)
        ],
        "materials": []
    },

    # 12. Master of Computer Applications (MCA)
    {
        "code": "MCA",
        "name": "Master of Computer Applications (MCA)",
        "department": "Master of Computer Applications (MCA)",
        "description": "Postgraduate professional program focusing on full-stack application development, enterprise cloud computing, mobile application architecture, and IT project engineering.",
        "subjects_r2021": [
            ("MC4101", "Advanced Data Structures and Algorithms", 1, 4),
            ("MC4102", "Object Oriented Software Engineering", 1, 3),
            ("MC4103", "Advanced Database Technology", 1, 3),
            ("MC4104", "Mathematical Foundations of Computer Science", 1, 4),
            ("MC4201", "Full Stack Web Application Development", 2, 4),
            ("MC4202", "Cloud Computing and DevOps Engineering", 2, 3),
            ("MC4203", "Mobile Application Development", 2, 3),
            ("MC4301", "Machine Learning and Deep Learning", 3, 4),
            ("MC4302", "Software Project Management & Agile Methodologies", 3, 3),
            ("MC4401", "Project Work / Industrial Capstone", 4, 12)
        ],
        "materials": []
    }
]


def seed_all_curriculum(db):
    """
    Seeds all remaining departments, regulations (2021 & 2025), semesters (1-8),
    subjects, and verified study materials into the database.
    Idempotent and safe to run multiple times without duplicating data.
    """
    print("[Curriculum Seeder] Verifying and seeding multi-department curriculum catalog...")

    for dept in CURRICULUM_DATA:
        code = dept["code"]
        name = dept["name"]
        dept_name = dept["department"]
        description = dept["description"]

        # 1. Seed or retrieve course
        course = db.execute_query("SELECT * FROM courses WHERE code = ?", (code,), fetch_one=True)
        if not course:
            print(f"[Curriculum Seeder] Seeding course: {name} ({code})")
            course_id = db.execute_query(
                "INSERT INTO courses (name, code, department, description) VALUES (?, ?, ?, ?)",
                (name, code, dept_name, description),
                commit=True
            )
        else:
            course_id = course["id"]

        # 2. Seed Regulation 2021
        reg_2021 = db.execute_query(
            "SELECT * FROM regulations WHERE course_id = ? AND code = ?",
            (course_id, "R2021"), fetch_one=True
        )
        if not reg_2021:
            reg_2021_id = db.execute_query(
                """
                INSERT INTO regulations (course_id, name, code, year, description, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    course_id,
                    "Regulation 2021",
                    "R2021",
                    2021,
                    f"Anna University CBCS Curriculum with verified semester courses, unit-wise notes, and authentic academic resources for {name}.",
                    1
                ),
                commit=True
            )
        else:
            reg_2021_id = reg_2021["id"]

        # 3. Seed Regulation 2025
        reg_2025 = db.execute_query(
            "SELECT * FROM regulations WHERE course_id = ? AND code = ?",
            (course_id, "R2025"), fetch_one=True
        )
        if not reg_2025:
            reg_2025_id = db.execute_query(
                """
                INSERT INTO regulations (course_id, name, code, year, description, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    course_id,
                    "Regulation 2025",
                    "R2025",
                    2025,
                    f"Autonomous next-generation Industry 5.0 & AI-integrated Curriculum for {name} (Modules in active preparation).",
                    1
                ),
                commit=True
            )
        else:
            reg_2025_id = reg_2025["id"]

        # 4. Seed Semesters for R2021 (1 to 8 for UG, 1 to 4 for PG)
        max_sems = 4 if code in ["ME-CSE", "MBA", "MCA"] else 8
        r2021_sem_map = {}
        for sem_num in range(1, max_sems + 1):
            sem_record = db.execute_query(
                "SELECT * FROM semesters WHERE regulation_id = ? AND semester_number = ?",
                (reg_2021_id, sem_num), fetch_one=True
            )
            year_name = "First Year" if sem_num in (1, 2) else "Second Year" if sem_num in (3, 4) else "Third Year" if sem_num in (5, 6) else "Final Year"
            if not sem_record:
                sem_id = db.execute_query(
                    "INSERT INTO semesters (regulation_id, semester_number, title, academic_year) VALUES (?, ?, ?, ?)",
                    (reg_2021_id, sem_num, f"Semester {sem_num}", year_name),
                    commit=True
                )
                r2021_sem_map[sem_num] = sem_id
            else:
                r2021_sem_map[sem_num] = sem_record["id"]

        # 5. Seed Semesters for R2025
        for sem_num in range(1, max_sems + 1):
            sem_record = db.execute_query(
                "SELECT * FROM semesters WHERE regulation_id = ? AND semester_number = ?",
                (reg_2025_id, sem_num), fetch_one=True
            )
            year_name = "First Year" if sem_num in (1, 2) else "Second Year" if sem_num in (3, 4) else "Third Year" if sem_num in (5, 6) else "Final Year"
            if not sem_record:
                db.execute_query(
                    "INSERT INTO semesters (regulation_id, semester_number, title, academic_year) VALUES (?, ?, ?, ?)",
                    (reg_2025_id, sem_num, f"Semester {sem_num}", year_name),
                    commit=True
                )

        # 6. Seed Subjects for R2021
        subjects_list = dept.get("subjects_r2021", [])
        for sub_code, sub_name, sem_num, creds in subjects_list:
            sem_id = r2021_sem_map.get(sem_num)
            existing_sub = db.execute_query("SELECT id FROM subjects WHERE subject_code = ?", (sub_code,), fetch_one=True)
            if existing_sub:
                # Update if semester_id is not set
                db.execute_query(
                    "UPDATE subjects SET subject_name = ?, semester_id = COALESCE(semester_id, ?), credits = ?, department = ?, semester = ? WHERE subject_code = ?",
                    (sub_name, sem_id, creds, dept_name, sem_num, sub_code),
                    commit=True
                )
            else:
                db.execute_query(
                    "INSERT INTO subjects (subject_code, subject_name, department, semester, semester_id, credits) VALUES (?, ?, ?, ?, ?, ?)",
                    (sub_code, sub_name, dept_name, sem_num, sem_id, creds),
                    commit=True
                )

        # 7. Seed Materials
        for mat_group in dept.get("materials", []):
            sc = mat_group["subject_code"]
            target_sub = db.execute_query("SELECT id FROM subjects WHERE subject_code = ?", (sc,), fetch_one=True)
            if target_sub:
                sid = target_sub["id"]
                current_cnt = db.execute_query("SELECT COUNT(*) as c FROM study_materials WHERE subject_id = ?", (sid,), fetch_one=True)["c"]
                if current_cnt == 0:
                    for title, mtype, unit, url, source, ac_year in mat_group["items"]:
                        db.execute_query(
                            """
                            INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                            """,
                            (sid, title, mtype, unit, url, source, ac_year),
                            commit=True
                        )

    print("[Curriculum Seeder] All departments, regulations, semesters, subjects, and verified materials ready.")
