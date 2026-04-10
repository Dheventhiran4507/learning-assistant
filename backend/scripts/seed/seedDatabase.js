const mongoose = require('mongoose');
const Syllabus = require('../../models/Syllabus');
const Student = require('../../models/Student');
require('dotenv').config();

// Anna University R2021 Syllabus Data

const syllabusData = [
    {
        "subjectCode": "IP3151",
        "subjectName": "Induction Programme",
        "regulation": "R2021",
        "semester": 1,
        "credits": 0,
        "units": [],
        "importantTopics": [],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "HS3151",
        "subjectName": "Professional English - I",
        "regulation": "R2021",
        "semester": 1,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Language and Communication",
                "topics": [
                    {
                        "topicName": "Reading Skills"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Tenses",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "MA3151",
        "subjectName": "Matrices and Calculus",
        "regulation": "R2021",
        "semester": 1,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Matrices",
                "topics": [
                    {
                        "topicName": "Matrix Operations and Properties"
                    },
                    {
                        "topicName": "Rank of a Matrix"
                    },
                    {
                        "topicName": "Inverse of Matrix"
                    },
                    {
                        "topicName": "System of Linear Equations"
                    },
                    {
                        "topicName": "Eigenvalues and Eigenvectors"
                    },
                    {
                        "topicName": "Cayley-Hamilton Theorem"
                    },
                    {
                        "topicName": "Diagonalization"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 2,
                "unitTitle": "Differential Calculus",
                "topics": [
                    {
                        "topicName": "Limits and Continuity"
                    },
                    {
                        "topicName": "Differentiation Techniques"
                    },
                    {
                        "topicName": "Partial Derivatives"
                    },
                    {
                        "topicName": "Total Derivative"
                    },
                    {
                        "topicName": "Chain Rule"
                    },
                    {
                        "topicName": "Implicit Differentiation"
                    },
                    {
                        "topicName": "Taylor Series Expansion"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 3,
                "unitTitle": "Functions of Several Variables",
                "topics": [
                    {
                        "topicName": "Maxima and Minima"
                    },
                    {
                        "topicName": "Lagrange Multipliers"
                    },
                    {
                        "topicName": "Jacobians"
                    },
                    {
                        "topicName": "Gradient Vector"
                    },
                    {
                        "topicName": "Directional Derivatives"
                    },
                    {
                        "topicName": "Critical Points"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 4,
                "unitTitle": "Integral Calculus",
                "topics": [
                    {
                        "topicName": "Multiple Integrals"
                    },
                    {
                        "topicName": "Double Integrals"
                    },
                    {
                        "topicName": "Triple Integrals"
                    },
                    {
                        "topicName": "Change of Variables"
                    },
                    {
                        "topicName": "Applications of Integration"
                    },
                    {
                        "topicName": "Volume Calculation"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 5,
                "unitTitle": "Vector Calculus",
                "topics": [
                    {
                        "topicName": "Gradient"
                    },
                    {
                        "topicName": "Divergence"
                    },
                    {
                        "topicName": "Curl"
                    },
                    {
                        "topicName": "Line Integrals"
                    },
                    {
                        "topicName": "Surface Integrals"
                    },
                    {
                        "topicName": "Green's Theorem"
                    },
                    {
                        "topicName": "Stokes Theorem"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Cayley-Hamilton Theorem",
                "weightage": 20,
                "frequency": "Very High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "PH3151",
        "subjectName": "Engineering Physics",
        "regulation": "R2021",
        "semester": 1,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Properties of Matter",
                "topics": [
                    {
                        "topicName": "Elasticity and Stress-Strain"
                    },
                    {
                        "topicName": "Crystal Physics and Structure"
                    },
                    {
                        "topicName": "Dielectric Materials"
                    },
                    {
                        "topicName": "Magnetic Properties"
                    },
                    {
                        "topicName": "Superconductivity Basics"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "Waves and Optics",
                "topics": [
                    {
                        "topicName": "Interference Phenomenon"
                    },
                    {
                        "topicName": "Diffraction Patterns"
                    },
                    {
                        "topicName": "Polarization of Light"
                    },
                    {
                        "topicName": "Fiber Optics Technology"
                    },
                    {
                        "topicName": "Laser Fundamentals"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "Thermal Physics",
                "topics": [
                    {
                        "topicName": "Heat Transfer Mechanisms"
                    },
                    {
                        "topicName": "Thermodynamics Laws"
                    },
                    {
                        "topicName": "Quantum Theory Basics"
                    },
                    {
                        "topicName": "Black Body Radiation"
                    },
                    {
                        "topicName": "Entropy and Statistical Mechanics"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "Acoustics and Ultrasonics",
                "topics": [
                    {
                        "topicName": "Sound Wave Properties"
                    },
                    {
                        "topicName": "Ultrasonics Applications"
                    },
                    {
                        "topicName": "Acoustic Properties"
                    },
                    {
                        "topicName": "Reverberation and Absorption"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "Semiconductor Physics",
                "topics": [
                    {
                        "topicName": "Band Theory of Solids"
                    },
                    {
                        "topicName": "P-N Junction Diode"
                    },
                    {
                        "topicName": "Transistor Operation"
                    },
                    {
                        "topicName": "Photodiodes and LEDs"
                    },
                    {
                        "topicName": "Semiconductor Applications"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Elasticity",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CY3151",
        "subjectName": "Engineering Chemistry",
        "regulation": "R2021",
        "semester": 1,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Water Technology",
                "topics": [
                    {
                        "topicName": "Hardness"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Hardness of Water",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "GE3151",
        "subjectName": "Problem Solving and Python Programming",
        "regulation": "R2021",
        "semester": 1,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Computational Thinking",
                "topics": [
                    {
                        "topicName": "Algorithms"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Algorithmic Problem Solving",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "GE3152",
        "subjectName": "Heritage of Tamils",
        "regulation": "R2021",
        "semester": 1,
        "credits": 1,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "LANGUAGE AND LITERATURE / மொழி மற்றும் இலக்கியம்",
                "topics": [
                    {
                        "topicName": "Language Families in India"
                    },
                    {
                        "topicName": "Dravidian Languages"
                    },
                    {
                        "topicName": "Tamil as a Classical Language"
                    },
                    {
                        "topicName": "Classical Literature in Tamil"
                    },
                    {
                        "topicName": "Secular Nature of Sangam Literature"
                    },
                    {
                        "topicName": "Distributive Justice in Sangam Literature"
                    },
                    {
                        "topicName": "Management Principles in Thirukural"
                    },
                    {
                        "topicName": "Tamil Epics"
                    },
                    {
                        "topicName": "Impact of Buddhism & Jainism"
                    },
                    {
                        "topicName": "Bakthi Literature"
                    },
                    {
                        "topicName": "Azhwars and Nayanmars"
                    },
                    {
                        "topicName": "Forms of minor Poetry"
                    },
                    {
                        "topicName": "Development of Modern literature in Tamil"
                    },
                    {
                        "topicName": "Contribution of Bharathiyar and Bharathidhasan"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 2,
                "unitTitle": "HERITAGE - ROCK ART PAINTINGS TO MODERN ART - SCULPTURE",
                "topics": [
                    {
                        "topicName": "Hero stone to modern sculpture"
                    },
                    {
                        "topicName": "Bronze icons"
                    },
                    {
                        "topicName": "Tribes and their handicrafts"
                    },
                    {
                        "topicName": "Art of temple car making"
                    },
                    {
                        "topicName": "Massive Terracotta sculptures"
                    },
                    {
                        "topicName": "Village deities"
                    },
                    {
                        "topicName": "Thiruvalluvar Statue at Kanyakumari"
                    },
                    {
                        "topicName": "Making of musical instruments"
                    },
                    {
                        "topicName": "Role of Temples in Social and Economic Life of Tamils"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 3,
                "unitTitle": "FOLK AND MARTIAL ARTS",
                "topics": [
                    {
                        "topicName": "Therukoothu"
                    },
                    {
                        "topicName": "Karagattam"
                    },
                    {
                        "topicName": "Villu Pattu"
                    },
                    {
                        "topicName": "Kaniyan Koothu"
                    },
                    {
                        "topicName": "Oyillattam"
                    },
                    {
                        "topicName": "Leather puppetry"
                    },
                    {
                        "topicName": "Silambattam"
                    },
                    {
                        "topicName": "Valari"
                    },
                    {
                        "topicName": "Tiger dance"
                    },
                    {
                        "topicName": "Sports and Games of Tamils"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 4,
                "unitTitle": "THINAI CONCEPT OF TAMILS",
                "topics": [
                    {
                        "topicName": "Flora and Fauna of Tamils"
                    },
                    {
                        "topicName": "Aham and Puram Concept"
                    },
                    {
                        "topicName": "Aram Concept of Tamils"
                    },
                    {
                        "topicName": "Education and Literacy during Sangam Age"
                    },
                    {
                        "topicName": "Ancient Cities and Ports of Sangam Age"
                    },
                    {
                        "topicName": "Export and Import during Sangam Age"
                    },
                    {
                        "topicName": "Overseas Conquest of Cholas"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 5,
                "unitTitle": "CONTRIBUTION OF TAMILS TO INDIAN CULTURE",
                "topics": [
                    {
                        "topicName": "Contribution of Tamils to Indian Freedom Struggle"
                    },
                    {
                        "topicName": "The Cultural Influence of Tamils"
                    },
                    {
                        "topicName": "Self-Respect Movement"
                    },
                    {
                        "topicName": "Role of Siddha Medicine"
                    },
                    {
                        "topicName": "Inscriptions and Manuscripts"
                    },
                    {
                        "topicName": "Print History of Tamil Books"
                    }
                ],
                "hours": 3
            }
        ],
        "importantTopics": [],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "HS3251",
        "subjectName": "Professional English - II",
        "regulation": "R2021",
        "semester": 2,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "MAKING COMPARISONS",
                "topics": [
                    {
                        "topicName": "Reading advertisements"
                    },
                    {
                        "topicName": "User manuals"
                    },
                    {
                        "topicName": "Brochures"
                    },
                    {
                        "topicName": "Professional emails"
                    },
                    {
                        "topicName": "Email etiquette"
                    },
                    {
                        "topicName": "Compare and Contrast Essay"
                    },
                    {
                        "topicName": "Mixed Tenses"
                    },
                    {
                        "topicName": "Prepositional phrases"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 2,
                "unitTitle": "EXPRESSING CAUSAL RELATIONS",
                "topics": [
                    {
                        "topicName": "Cause and Effect Essays"
                    },
                    {
                        "topicName": "Letters and emails of complaint"
                    },
                    {
                        "topicName": "Writing responses to complaints"
                    },
                    {
                        "topicName": "Active Passive Voice transformations"
                    },
                    {
                        "topicName": "Infinitive and Gerunds"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 3,
                "unitTitle": "PROBLEM SOLVING",
                "topics": [
                    {
                        "topicName": "Case Studies"
                    },
                    {
                        "topicName": "Excerpts from literary texts"
                    },
                    {
                        "topicName": "News reports"
                    },
                    {
                        "topicName": "Letter to the Editor"
                    },
                    {
                        "topicName": "Checklists"
                    },
                    {
                        "topicName": "Problem solution essay"
                    },
                    {
                        "topicName": "Argumentative Essay"
                    },
                    {
                        "topicName": "Error correction"
                    },
                    {
                        "topicName": "If conditional sentences"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 4,
                "unitTitle": "REPORTING OF EVENTS AND RESEARCH",
                "topics": [
                    {
                        "topicName": "Newspaper articles"
                    },
                    {
                        "topicName": "Writing Recommendations"
                    },
                    {
                        "topicName": "Transcoding"
                    },
                    {
                        "topicName": "Accident Report"
                    },
                    {
                        "topicName": "Survey Report"
                    },
                    {
                        "topicName": "Reported Speech"
                    },
                    {
                        "topicName": "Modals"
                    },
                    {
                        "topicName": "Vocabulary, Conjunctions"
                    },
                    {
                        "topicName": "Use of prepositions"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 5,
                "unitTitle": "THE ABILITY TO PUT IDEAS",
                "topics": [
                    {
                        "topicName": "Company profiles"
                    },
                    {
                        "topicName": "Statement of Purpose"
                    },
                    {
                        "topicName": "Excerpt of interview with professionals"
                    },
                    {
                        "topicName": "Job and Internship application"
                    },
                    {
                        "topicName": "Cover letter and Resume"
                    },
                    {
                        "topicName": "Numerical adjectives"
                    },
                    {
                        "topicName": "Relative Clauses"
                    }
                ],
                "hours": 6
            }
        ],
        "importantTopics": [
            {
                "topic": "Report Writing",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "MA3251",
        "subjectName": "Statistics and Numerical Methods",
        "regulation": "R2021",
        "semester": 2,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Testing of Hypothesis",
                "topics": [
                    {
                        "topicName": "T-Test"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Sampling Distributions",
                "weightage": 25,
                "frequency": "Very High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "PH3256",
        "subjectName": "Physics for Information Science",
        "regulation": "R2021",
        "semester": 2,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "ELECTRICAL PROPERTIES OF MATERIALS",
                "topics": [
                    {
                        "topicName": "Classical free electron theory"
                    },
                    {
                        "topicName": "Electrical conductivity"
                    },
                    {
                        "topicName": "Thermal conductivity"
                    },
                    {
                        "topicName": "Wiedemann-Franz law"
                    },
                    {
                        "topicName": "Particle in a 3D box"
                    },
                    {
                        "topicName": "Fermi-Dirac statistics"
                    },
                    {
                        "topicName": "Density of energy states"
                    },
                    {
                        "topicName": "Energy bands in solids"
                    },
                    {
                        "topicName": "Electron effective mass"
                    },
                    {
                        "topicName": "Concept of hole"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "SEMICONDUCTOR PHYSICS",
                "topics": [
                    {
                        "topicName": "Intrinsic Semiconductors"
                    },
                    {
                        "topicName": "Energy band diagram"
                    },
                    {
                        "topicName": "Direct and indirect band gap"
                    },
                    {
                        "topicName": "Carrier concentration in intrinsic semiconductors"
                    },
                    {
                        "topicName": "Extrinsic semiconductors"
                    },
                    {
                        "topicName": "Variation of carrier concentration with temperature"
                    },
                    {
                        "topicName": "Carrier transport in Semiconductor"
                    },
                    {
                        "topicName": "Drift, mobility and diffusion"
                    },
                    {
                        "topicName": "Hall effect and devices"
                    },
                    {
                        "topicName": "Ohmic contacts"
                    },
                    {
                        "topicName": "Schottky diode"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "MAGNETIC PROPERTIES OF MATERIALS",
                "topics": [
                    {
                        "topicName": "Magnetic dipole moment"
                    },
                    {
                        "topicName": "Magnetic permeability and susceptibility"
                    },
                    {
                        "topicName": "Diamagnetism"
                    },
                    {
                        "topicName": "Paramagnetism"
                    },
                    {
                        "topicName": "Ferromagnetism"
                    },
                    {
                        "topicName": "Antiferromagnetism"
                    },
                    {
                        "topicName": "Ferrimagnetism"
                    },
                    {
                        "topicName": "Curie temperature"
                    },
                    {
                        "topicName": "Domain Theory"
                    },
                    {
                        "topicName": "Hard and soft magnetic materials"
                    },
                    {
                        "topicName": "Magnetic principle in computer data storage"
                    },
                    {
                        "topicName": "Magnetic hard disc"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "OPTICAL PROPERTIES OF MATERIALS",
                "topics": [
                    {
                        "topicName": "Classification of optical materials"
                    },
                    {
                        "topicName": "Carrier generation and recombination"
                    },
                    {
                        "topicName": "Absorption emission and scattering of light"
                    },
                    {
                        "topicName": "Photo current in a P-N diode"
                    },
                    {
                        "topicName": "Solar cell"
                    },
                    {
                        "topicName": "LED"
                    },
                    {
                        "topicName": "Organic LED"
                    },
                    {
                        "topicName": "Laser diodes"
                    },
                    {
                        "topicName": "Optical data storage techniques"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "NANODEVICES AND QUANTUM COMPUTING",
                "topics": [
                    {
                        "topicName": "Quantum confinement"
                    },
                    {
                        "topicName": "Quantum structures: wells, wires, dots"
                    },
                    {
                        "topicName": "Band gap of nanomaterials"
                    },
                    {
                        "topicName": "Tunneling"
                    },
                    {
                        "topicName": "Single electron phenomena"
                    },
                    {
                        "topicName": "Coulomb blockade"
                    },
                    {
                        "topicName": "Resonant tunneling diode"
                    },
                    {
                        "topicName": "Single electron transistor"
                    },
                    {
                        "topicName": "Quantum cellular automata"
                    },
                    {
                        "topicName": "Quantum system for information processing"
                    },
                    {
                        "topicName": "Quantum states and qubits"
                    },
                    {
                        "topicName": "CNOT gate and Bloch sphere"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Semiconductor Physics",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "BE3251",
        "subjectName": "Basic Electrical and Electronics Engineering",
        "regulation": "R2021",
        "semester": 2,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "ELECTRICAL CIRCUITS",
                "topics": [
                    {
                        "topicName": "Circuit Components: Conductor, Resistor, Inductor, Capacitor"
                    },
                    {
                        "topicName": "Ohm's Law"
                    },
                    {
                        "topicName": "Kirchhoff's Laws"
                    },
                    {
                        "topicName": "Dependent and Independent Sources"
                    },
                    {
                        "topicName": "Nodal and Mesh analysis"
                    },
                    {
                        "topicName": "Introduction to AC Circuits"
                    },
                    {
                        "topicName": "RMS Value, Average value"
                    },
                    {
                        "topicName": "Real, reactive, apparent power and power factor"
                    },
                    {
                        "topicName": "Steady state analysis of RLC circuits"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "ELECTRICAL MACHINES",
                "topics": [
                    {
                        "topicName": "Construction and Working principle DC Generators"
                    },
                    {
                        "topicName": "Types and Applications of DC Generators"
                    },
                    {
                        "topicName": "Working Principle of DC motors"
                    },
                    {
                        "topicName": "Torque Equation"
                    },
                    {
                        "topicName": "Construction and Working principle of Transformer"
                    },
                    {
                        "topicName": "Three phase Alternator"
                    },
                    {
                        "topicName": "Synchronous motor"
                    },
                    {
                        "topicName": "Three Phase Induction Motor"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "ANALOG ELECTRONICS",
                "topics": [
                    {
                        "topicName": "Semiconductor Materials: Silicon & Germanium"
                    },
                    {
                        "topicName": "PN Junction Diodes"
                    },
                    {
                        "topicName": "Zener Diode Characteristics"
                    },
                    {
                        "topicName": "Bipolar Junction Transistor Biasing"
                    },
                    {
                        "topicName": "JFET, SCR, MOSFET, IGBT"
                    },
                    {
                        "topicName": "Rectifier and Inverters"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "DIGITAL ELECTRONICS",
                "topics": [
                    {
                        "topicName": "Review of number systems"
                    },
                    {
                        "topicName": "Binary codes"
                    },
                    {
                        "topicName": "Error detection and correction codes"
                    },
                    {
                        "topicName": "Combinational logic"
                    },
                    {
                        "topicName": "SOP and POS forms"
                    },
                    {
                        "topicName": "K-map representations"
                    },
                    {
                        "topicName": "Minimization using K maps"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "MEASUREMENTS AND INSTRUMENTATION",
                "topics": [
                    {
                        "topicName": "Functional elements of an instrument"
                    },
                    {
                        "topicName": "Standards and calibration"
                    },
                    {
                        "topicName": "Moving Coil and Moving Iron meters"
                    },
                    {
                        "topicName": "Measurement of three phase power"
                    },
                    {
                        "topicName": "Energy Meter"
                    },
                    {
                        "topicName": "Instrument Transformers CT and PT"
                    },
                    {
                        "topicName": "DSO Block diagram"
                    },
                    {
                        "topicName": "Data acquisition"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "AC Circuits",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "GE3251",
        "subjectName": "Engineering Graphics",
        "regulation": "R2021",
        "semester": 2,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "PLANE CURVES",
                "topics": [
                    {
                        "topicName": "Basic Geometrical constructions"
                    },
                    {
                        "topicName": "Conics Construction of ellipse, parabola and hyperbola"
                    },
                    {
                        "topicName": "Construction of cycloid"
                    },
                    {
                        "topicName": "Construction of involutes of square and circle"
                    },
                    {
                        "topicName": "Drawing of tangents and normal"
                    }
                ],
                "hours": 18
            },
            {
                "unitNumber": 2,
                "unitTitle": "PROJECTION OF POINTS, LINES AND PLANE SURFACE",
                "topics": [
                    {
                        "topicName": "Orthographic projection principles"
                    },
                    {
                        "topicName": "First angle projection"
                    },
                    {
                        "topicName": "Projection of points and straight lines"
                    },
                    {
                        "topicName": "Determination of true lengths and true inclinations"
                    },
                    {
                        "topicName": "Projection of planes inclined to both principal planes"
                    }
                ],
                "hours": 18
            },
            {
                "unitNumber": 3,
                "unitTitle": "PROJECTION OF SOLIDS AND FREEHAND SKETCHING",
                "topics": [
                    {
                        "topicName": "Projection of simple solids like prisms, pyramids, cylinder, cone"
                    },
                    {
                        "topicName": "Solids inclined to one principal plane"
                    },
                    {
                        "topicName": "Visualization concepts and Free Hand sketching"
                    },
                    {
                        "topicName": "Representation of Three Dimensional objects"
                    },
                    {
                        "topicName": "Freehand sketching of multiple views"
                    }
                ],
                "hours": 18
            },
            {
                "unitNumber": 4,
                "unitTitle": "PROJECTION OF SECTIONED SOLIDS AND DEVELOPMENT",
                "topics": [
                    {
                        "topicName": "Sectioning of solids in simple vertical position"
                    },
                    {
                        "topicName": "Obtaining true shape of section"
                    },
                    {
                        "topicName": "Development of lateral surfaces of simple and sectioned solids"
                    },
                    {
                        "topicName": "Prisms, pyramids cylinders and cones"
                    }
                ],
                "hours": 18
            },
            {
                "unitNumber": 5,
                "unitTitle": "ISOMETRIC AND PERSPECTIVE PROJECTIONS",
                "topics": [
                    {
                        "topicName": "Principles of isometric projection"
                    },
                    {
                        "topicName": "Isometric scale"
                    },
                    {
                        "topicName": "Isometric projections of simple and truncated solids"
                    },
                    {
                        "topicName": "Perspective projection of simple solids by visual ray method"
                    }
                ],
                "hours": 18
            }
        ],
        "importantTopics": [
            {
                "topic": "Projection of Solids",
                "weightage": 30,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3251",
        "subjectName": "Programming in C",
        "regulation": "R2021",
        "semester": 2,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Basics of C",
                "topics": [
                    {
                        "topicName": "Structure of C",
                        "difficulty": "easy"
                    },
                    {
                        "topicName": "Data Types",
                        "difficulty": "easy"
                    },
                    {
                        "topicName": "Variables and Constants",
                        "difficulty": "easy"
                    },
                    {
                        "topicName": "Operators",
                        "difficulty": "medium"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "Arrays and Strings",
                "topics": [
                    {
                        "topicName": "1D Arrays",
                        "difficulty": "medium"
                    },
                    {
                        "topicName": "2D Arrays",
                        "difficulty": "hard"
                    },
                    {
                        "topicName": "String Operations",
                        "difficulty": "medium"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "Functions and Pointers",
                "topics": [
                    {
                        "topicName": "Function Declaration",
                        "difficulty": "medium"
                    },
                    {
                        "topicName": "Call by Value vs Reference",
                        "difficulty": "hard"
                    },
                    {
                        "topicName": "Pointers Introduction",
                        "difficulty": "hard"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "Structures",
                "topics": [
                    {
                        "topicName": "Defining Structures",
                        "difficulty": "medium"
                    },
                    {
                        "topicName": "Nested Structures",
                        "difficulty": "hard"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "File Processing",
                "topics": [
                    {
                        "topicName": "File Open and Close",
                        "difficulty": "medium"
                    },
                    {
                        "topicName": "Reading and Writing Files",
                        "difficulty": "hard"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Pointers",
                "weightage": 25,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "GE3252",
        "subjectName": "Tamils and Technology",
        "regulation": "R2021",
        "semester": 2,
        "credits": 1,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "WEAVING AND CERAMIC TECHNOLOGY",
                "topics": [
                    {
                        "topicName": "Weaving Industry during Sangam Age"
                    },
                    {
                        "topicName": "Ceramic technology"
                    },
                    {
                        "topicName": "Black and Red Ware Potteries"
                    },
                    {
                        "topicName": "Potsherds in Tamil Brahmi"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 2,
                "unitTitle": "DESIGN AND CONSTRUCTION TECHNOLOGY",
                "topics": [
                    {
                        "topicName": "Designing and Structural engineering during Sangam Age"
                    },
                    {
                        "topicName": "Building materials and Hero stones"
                    },
                    {
                        "topicName": "Sculptures and Temples Pallava and Chola Period"
                    },
                    {
                        "topicName": "Architectural Designs"
                    },
                    {
                        "topicName": "Rock cut temples"
                    },
                    {
                        "topicName": "Monolithic stone"
                    },
                    {
                        "topicName": "Thirumalai Nayakar Mahal"
                    },
                    {
                        "topicName": "Chettinad Houses"
                    },
                    {
                        "topicName": "Indo-Saracenic architecture"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 3,
                "unitTitle": "MANUFACTURING TECHNOLOGY",
                "topics": [
                    {
                        "topicName": "Art of Ship Building"
                    },
                    {
                        "topicName": "Metallurgical studies"
                    },
                    {
                        "topicName": "Iron industry"
                    },
                    {
                        "topicName": "Iron smelting"
                    },
                    {
                        "topicName": "Steel - Wootz steel"
                    },
                    {
                        "topicName": "Coinage and Minting"
                    },
                    {
                        "topicName": "Copper and gold coins"
                    },
                    {
                        "topicName": "Shell pearls and ivory"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 4,
                "unitTitle": "AGRICULTURE AND IRRIGATION TECHNOLOGY",
                "topics": [
                    {
                        "topicName": "Agricultural knowledge in Sangam Literature"
                    },
                    {
                        "topicName": "Water management in Soil and minerals"
                    },
                    {
                        "topicName": "Paddy Cultivation"
                    },
                    {
                        "topicName": "Irrigation technology"
                    },
                    {
                        "topicName": "Dams, Tanks, Ponds"
                    },
                    {
                        "topicName": "Kallanai Dam"
                    }
                ],
                "hours": 3
            },
            {
                "unitNumber": 5,
                "unitTitle": "SCIENTIFIC TAMIL & TAMIL COMPUTING",
                "topics": [
                    {
                        "topicName": "Development of Scientific Tamil"
                    },
                    {
                        "topicName": "Tamil computing"
                    },
                    {
                        "topicName": "Keyboard development"
                    },
                    {
                        "topicName": "Tamil spell checker"
                    },
                    {
                        "topicName": "Computer fonts"
                    },
                    {
                        "topicName": "Software translation"
                    }
                ],
                "hours": 3
            }
        ],
        "importantTopics": [],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "MA3354",
        "subjectName": "Discrete Mathematics",
        "regulation": "R2021",
        "semester": 3,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "LOGIC AND PROOFS",
                "topics": [
                    {
                        "topicName": "Propositional logic"
                    },
                    {
                        "topicName": "Propositional equivalences"
                    },
                    {
                        "topicName": "Predicates and quantifiers"
                    },
                    {
                        "topicName": "Nested quantifiers"
                    },
                    {
                        "topicName": "Rules of inference"
                    },
                    {
                        "topicName": "Introduction to proofs"
                    },
                    {
                        "topicName": "Proof methods and strategy"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 2,
                "unitTitle": "COMBINATORICS",
                "topics": [
                    {
                        "topicName": "Mathematical induction"
                    },
                    {
                        "topicName": "Strong induction and well-ordering"
                    },
                    {
                        "topicName": "The basics of counting"
                    },
                    {
                        "topicName": "The pigeonhole principle"
                    },
                    {
                        "topicName": "Permutations and combinations"
                    },
                    {
                        "topicName": "Recurrence relations"
                    },
                    {
                        "topicName": "Solving linear recurrence relations"
                    },
                    {
                        "topicName": "Generating functions"
                    },
                    {
                        "topicName": "Inclusion and exclusion principle"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 3,
                "unitTitle": "GRAPHS",
                "topics": [
                    {
                        "topicName": "Graphs and graph models"
                    },
                    {
                        "topicName": "Graph terminology and special types of graphs"
                    },
                    {
                        "topicName": "Matrix representation of graphs and graph isomorphism"
                    },
                    {
                        "topicName": "Connectivity"
                    },
                    {
                        "topicName": "Euler and Hamilton paths"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 4,
                "unitTitle": "ALGEBRAIC STRUCTURES",
                "topics": [
                    {
                        "topicName": "Algebraic systems"
                    },
                    {
                        "topicName": "Semi groups and monoids"
                    },
                    {
                        "topicName": "Groups"
                    },
                    {
                        "topicName": "Subgroups"
                    },
                    {
                        "topicName": "Homomorphism's"
                    },
                    {
                        "topicName": "Normal subgroup and cosets"
                    },
                    {
                        "topicName": "Lagrange's theorem"
                    },
                    {
                        "topicName": "Definitions and examples of Rings and Fields"
                    }
                ],
                "hours": 12
            },
            {
                "unitNumber": 5,
                "unitTitle": "LATTICES AND BOOLEAN ALGEBRA",
                "topics": [
                    {
                        "topicName": "Partial ordering"
                    },
                    {
                        "topicName": "Posets"
                    },
                    {
                        "topicName": "Lattices as posets"
                    },
                    {
                        "topicName": "Properties of lattices"
                    },
                    {
                        "topicName": "Lattices as algebraic systems"
                    },
                    {
                        "topicName": "Sub lattices"
                    },
                    {
                        "topicName": "Direct product and homomorphism"
                    },
                    {
                        "topicName": "Some special lattices"
                    },
                    {
                        "topicName": "Boolean algebra"
                    },
                    {
                        "topicName": "Sub Boolean Algebra"
                    },
                    {
                        "topicName": "Boolean Homomorphism"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Graph Theory",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3351",
        "subjectName": "Digital Principles and Computer Organization",
        "regulation": "R2021",
        "semester": 3,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Digital Fundamentals",
                "topics": [
                    {
                        "topicName": "Number Systems"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Memory Organization",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3352",
        "subjectName": "Foundations of Data Science",
        "regulation": "R2021",
        "semester": 3,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Introduction",
                "topics": [
                    {
                        "topicName": "Data Science Process"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Exploratory Data Analysis",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3301",
        "subjectName": "Data Structures",
        "regulation": "R2021",
        "semester": 3,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "List",
                "topics": [
                    {
                        "topicName": "Abstract Data Types"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Graph Traversals",
                "weightage": 25,
                "frequency": "Very High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3391",
        "subjectName": "Object Oriented Programming",
        "regulation": "R2021",
        "semester": 3,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Introduction to OOP and Java",
                "topics": [
                    {
                        "topicName": "OOP Concepts - Abstraction and Encapsulation"
                    },
                    {
                        "topicName": "Inheritance and Polymorphism"
                    },
                    {
                        "topicName": "Java Programming Basics"
                    },
                    {
                        "topicName": "Data Types and Variables"
                    },
                    {
                        "topicName": "Operators and Expressions"
                    },
                    {
                        "topicName": "Control Flow Statements"
                    },
                    {
                        "topicName": "Methods and Parameters"
                    },
                    {
                        "topicName": "Arrays in Java"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "Inheritance and Interfaces",
                "topics": [
                    {
                        "topicName": "Single Inheritance"
                    },
                    {
                        "topicName": "Multilevel Inheritance"
                    },
                    {
                        "topicName": "Hierarchical Inheritance"
                    },
                    {
                        "topicName": "Interface Declaration and Implementation"
                    },
                    {
                        "topicName": "Abstract Classes"
                    },
                    {
                        "topicName": "Super Keyword Usage"
                    },
                    {
                        "topicName": "Method Overriding"
                    },
                    {
                        "topicName": "Dynamic Method Dispatch"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "Packages and Exception Handling",
                "topics": [
                    {
                        "topicName": "Package Creation and Usage"
                    },
                    {
                        "topicName": "Access Modifiers - Public Private Protected"
                    },
                    {
                        "topicName": "Exception Handling Basics"
                    },
                    {
                        "topicName": "Try-Catch Blocks"
                    },
                    {
                        "topicName": "Throw and Throws Keywords"
                    },
                    {
                        "topicName": "Custom Exception Classes"
                    },
                    {
                        "topicName": "Finally Block"
                    },
                    {
                        "topicName": "Chained Exceptions"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "Multithreading and Synchronization",
                "topics": [
                    {
                        "topicName": "Thread Life Cycle"
                    },
                    {
                        "topicName": "Creating Threads - Runnable and Thread"
                    },
                    {
                        "topicName": "Thread Synchronization"
                    },
                    {
                        "topicName": "Inter-thread Communication"
                    },
                    {
                        "topicName": "Thread Priority Management"
                    },
                    {
                        "topicName": "Deadlock Handling"
                    },
                    {
                        "topicName": "Thread Pools"
                    },
                    {
                        "topicName": "Concurrent Collections"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "Collections and File I/O",
                "topics": [
                    {
                        "topicName": "ArrayList and LinkedList"
                    },
                    {
                        "topicName": "HashMap and HashSet"
                    },
                    {
                        "topicName": "Iterator and ListIterator"
                    },
                    {
                        "topicName": "File Input Output Operations"
                    },
                    {
                        "topicName": "Byte Streams and Character Streams"
                    },
                    {
                        "topicName": "Serialization and Deserialization"
                    },
                    {
                        "topicName": "BufferedReader and BufferedWriter"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Inheritance and Polymorphism",
                "weightage": 25,
                "frequency": "Very High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3452",
        "subjectName": "Theory of Computation",
        "regulation": "R2021",
        "semester": 4,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Automata Fundamentals",
                "topics": [
                    {
                        "topicName": "Finite Automata"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Turing Machines",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3491",
        "subjectName": "Artificial Intelligence and Machine Learning",
        "regulation": "R2021",
        "semester": 4,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Problem Solving",
                "topics": [
                    {
                        "topicName": "Search Algorithms"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Supervised Learning",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3492",
        "subjectName": "Database Management Systems",
        "regulation": "R2021",
        "semester": 4,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Introduction to DBMS",
                "topics": [
                    {
                        "topicName": "Database System Concepts"
                    },
                    {
                        "topicName": "DBMS Architecture - Two-tier Three-tier"
                    },
                    {
                        "topicName": "Data Models - Hierarchical Network Relational"
                    },
                    {
                        "topicName": "ER Model and ER Diagrams"
                    },
                    {
                        "topicName": "Entities Attributes Relationships"
                    },
                    {
                        "topicName": "Relational Model Basics"
                    },
                    {
                        "topicName": "Keys - Primary Foreign Candidate Super"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "SQL and Queries",
                "topics": [
                    {
                        "topicName": "DDL Commands - CREATE ALTER DROP"
                    },
                    {
                        "topicName": "DML Commands - INSERT UPDATE DELETE"
                    },
                    {
                        "topicName": "SELECT Statement and Clauses"
                    },
                    {
                        "topicName": "Joins - Inner Left Right Full Outer"
                    },
                    {
                        "topicName": "Aggregate Functions - COUNT SUM AVG MIN MAX"
                    },
                    {
                        "topicName": "GROUP BY and HAVING Clauses"
                    },
                    {
                        "topicName": "Subqueries - Nested Correlated"
                    },
                    {
                        "topicName": "Views and Indexes"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "Normalization",
                "topics": [
                    {
                        "topicName": "Functional Dependencies"
                    },
                    {
                        "topicName": "First Normal Form - 1NF"
                    },
                    {
                        "topicName": "Second Normal Form - 2NF"
                    },
                    {
                        "topicName": "Third Normal Form - 3NF"
                    },
                    {
                        "topicName": "Boyce-Codd Normal Form - BCNF"
                    },
                    {
                        "topicName": "Fourth Normal Form - 4NF"
                    },
                    {
                        "topicName": "Decomposition - Lossless Lossy"
                    },
                    {
                        "topicName": "Dependency Preservation"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "Transaction Management",
                "topics": [
                    {
                        "topicName": "ACID Properties - Atomicity Consistency Isolation Durability"
                    },
                    {
                        "topicName": "Transaction States"
                    },
                    {
                        "topicName": "Concurrency Control Techniques"
                    },
                    {
                        "topicName": "Locking Mechanisms - Shared Exclusive"
                    },
                    {
                        "topicName": "Two-Phase Locking Protocol"
                    },
                    {
                        "topicName": "Deadlock Detection and Prevention"
                    },
                    {
                        "topicName": "Recovery Techniques"
                    },
                    {
                        "topicName": "Log-based Recovery"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "NoSQL Databases",
                "topics": [
                    {
                        "topicName": "NoSQL Concepts and Types"
                    },
                    {
                        "topicName": "MongoDB Basics"
                    },
                    {
                        "topicName": "Document Database Structure"
                    },
                    {
                        "topicName": "CRUD Operations in MongoDB"
                    },
                    {
                        "topicName": "Aggregation Pipeline"
                    },
                    {
                        "topicName": "Indexing in MongoDB"
                    },
                    {
                        "topicName": "CAP Theorem"
                    },
                    {
                        "topicName": "NoSQL vs SQL Comparison"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Normalization",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3401",
        "subjectName": "Algorithms",
        "regulation": "R2021",
        "semester": 4,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Arrays and Linked Lists",
                "topics": [
                    {
                        "topicName": "Array Data Structure"
                    },
                    {
                        "topicName": "Array Operations - Insertion Deletion Traversal"
                    },
                    {
                        "topicName": "Singly Linked List"
                    },
                    {
                        "topicName": "Doubly Linked List"
                    },
                    {
                        "topicName": "Circular Linked List"
                    },
                    {
                        "topicName": "Applications of Linked Lists"
                    },
                    {
                        "topicName": "Polynomial Representation"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "Stacks and Queues",
                "topics": [
                    {
                        "topicName": "Stack Data Structure - LIFO"
                    },
                    {
                        "topicName": "Stack Operations - Push Pop Peek"
                    },
                    {
                        "topicName": "Infix to Postfix Conversion"
                    },
                    {
                        "topicName": "Expression Evaluation"
                    },
                    {
                        "topicName": "Queue Data Structure - FIFO"
                    },
                    {
                        "topicName": "Circular Queue Implementation"
                    },
                    {
                        "topicName": "Priority Queue"
                    },
                    {
                        "topicName": "Double Ended Queue - Deque"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "Trees and Binary Search Trees",
                "topics": [
                    {
                        "topicName": "Tree Terminology - Root Node Leaf Height"
                    },
                    {
                        "topicName": "Binary Tree Structure"
                    },
                    {
                        "topicName": "Binary Search Tree - BST"
                    },
                    {
                        "topicName": "Tree Traversals - Inorder Preorder Postorder"
                    },
                    {
                        "topicName": "BST Operations - Insertion Deletion Search"
                    },
                    {
                        "topicName": "AVL Trees and Balancing"
                    },
                    {
                        "topicName": "B-Trees and B+ Trees"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "Graphs and Graph Algorithms",
                "topics": [
                    {
                        "topicName": "Graph Representation - Adjacency Matrix List"
                    },
                    {
                        "topicName": "Breadth First Search - BFS"
                    },
                    {
                        "topicName": "Depth First Search - DFS"
                    },
                    {
                        "topicName": "Minimum Spanning Tree - MST"
                    },
                    {
                        "topicName": "Kruskal's Algorithm"
                    },
                    {
                        "topicName": "Prim's Algorithm"
                    },
                    {
                        "topicName": "Shortest Path - Dijkstra's Algorithm"
                    },
                    {
                        "topicName": "Bellman-Ford Algorithm"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "Sorting and Searching",
                "topics": [
                    {
                        "topicName": "Bubble Sort Algorithm"
                    },
                    {
                        "topicName": "Selection Sort"
                    },
                    {
                        "topicName": "Insertion Sort"
                    },
                    {
                        "topicName": "Merge Sort - Divide and Conquer"
                    },
                    {
                        "topicName": "Quick Sort Algorithm"
                    },
                    {
                        "topicName": "Heap Sort"
                    },
                    {
                        "topicName": "Linear Search"
                    },
                    {
                        "topicName": "Binary Search Algorithm"
                    },
                    {
                        "topicName": "Hashing Techniques"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Dynamic Programming",
                "weightage": 25,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3451",
        "subjectName": "Introduction to Operating Systems",
        "regulation": "R2021",
        "semester": 4,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Introduction to OS",
                "topics": [
                    {
                        "topicName": "Operating System Functions"
                    },
                    {
                        "topicName": "Types of Operating Systems"
                    },
                    {
                        "topicName": "System Calls and API"
                    },
                    {
                        "topicName": "Process Concept"
                    },
                    {
                        "topicName": "Process States and Transitions"
                    },
                    {
                        "topicName": "Process Control Block - PCB"
                    },
                    {
                        "topicName": "Context Switching Mechanism"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "CPU Scheduling",
                "topics": [
                    {
                        "topicName": "First Come First Serve - FCFS"
                    },
                    {
                        "topicName": "Shortest Job First - SJF"
                    },
                    {
                        "topicName": "Round Robin Scheduling"
                    },
                    {
                        "topicName": "Priority Scheduling"
                    },
                    {
                        "topicName": "Multilevel Queue Scheduling"
                    },
                    {
                        "topicName": "Multilevel Feedback Queue"
                    },
                    {
                        "topicName": "Scheduling Criteria and Metrics"
                    },
                    {
                        "topicName": "Gantt Chart Representation"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "Memory Management",
                "topics": [
                    {
                        "topicName": "Paging Concept and Implementation"
                    },
                    {
                        "topicName": "Segmentation Techniques"
                    },
                    {
                        "topicName": "Virtual Memory Management"
                    },
                    {
                        "topicName": "Page Replacement Algorithms"
                    },
                    {
                        "topicName": "FIFO Page Replacement"
                    },
                    {
                        "topicName": "LRU - Least Recently Used"
                    },
                    {
                        "topicName": "Optimal Page Replacement"
                    },
                    {
                        "topicName": "Thrashing and Working Set Model"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "Deadlock Management",
                "topics": [
                    {
                        "topicName": "Deadlock Conditions - Mutual Exclusion Hold and Wait"
                    },
                    {
                        "topicName": "Resource Allocation Graph"
                    },
                    {
                        "topicName": "Deadlock Prevention Strategies"
                    },
                    {
                        "topicName": "Deadlock Avoidance Techniques"
                    },
                    {
                        "topicName": "Banker's Algorithm"
                    },
                    {
                        "topicName": "Deadlock Detection Methods"
                    },
                    {
                        "topicName": "Recovery from Deadlock"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "File Systems and Disk Management",
                "topics": [
                    {
                        "topicName": "File System Concepts"
                    },
                    {
                        "topicName": "File Operations and Attributes"
                    },
                    {
                        "topicName": "Directory Structure - Single Level Two Level Tree"
                    },
                    {
                        "topicName": "File Allocation Methods - Contiguous Linked Indexed"
                    },
                    {
                        "topicName": "Disk Scheduling Algorithms"
                    },
                    {
                        "topicName": "FCFS Disk Scheduling"
                    },
                    {
                        "topicName": "SCAN and C-SCAN Algorithms"
                    },
                    {
                        "topicName": "LOOK and C-LOOK Algorithms"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Process Scheduling",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "GE3451",
        "subjectName": "Environmental Sciences and Sustainability",
        "regulation": "R2021",
        "semester": 4,
        "credits": 2,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Environment and Ecosystem",
                "topics": [
                    {
                        "topicName": "Biodiversity"
                    }
                ],
                "hours": 6
            }
        ],
        "importantTopics": [
            {
                "topic": "Pollution Control",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3591",
        "subjectName": "Computer Networks",
        "regulation": "R2021",
        "semester": 5,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Fundamentals",
                "topics": [
                    {
                        "topicName": "OSI Reference Model"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Routing Algorithms",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3501",
        "subjectName": "Compiler Design",
        "regulation": "R2021",
        "semester": 5,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "Lexical Analysis",
                "topics": [
                    {
                        "topicName": "Tokens"
                    }
                ],
                "hours": 12
            }
        ],
        "importantTopics": [
            {
                "topic": "Parsing Techniques",
                "weightage": 25,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CB3491",
        "subjectName": "Cryptography and Cyber Security",
        "regulation": "R2021",
        "semester": 5,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "INTRODUCTION AND NUMBER THEORY",
                "topics": [
                    {
                        "topicName": "Network security model"
                    },
                    {
                        "topicName": "Classical encryption techniques"
                    },
                    {
                        "topicName": "Symmetric cipher model"
                    },
                    {
                        "topicName": "Substitution techniques, transposition techniques, steganography"
                    },
                    {
                        "topicName": "Finite fields"
                    },
                    {
                        "topicName": "Groups, Rings, Fields"
                    },
                    {
                        "topicName": "Modular arithmetic"
                    },
                    {
                        "topicName": "Euclid's algorithm"
                    },
                    {
                        "topicName": "Finite fields of the form GF(p)"
                    },
                    {
                        "topicName": "Polynomial arithmetic"
                    },
                    {
                        "topicName": "Finite fields of the form GF(2n)"
                    },
                    {
                        "topicName": "Prime numbers"
                    },
                    {
                        "topicName": "Fermat's and Euler's theorem"
                    },
                    {
                        "topicName": "Testing for primality"
                    },
                    {
                        "topicName": "Chinese Remainder theorem"
                    },
                    {
                        "topicName": "Discrete logarithms"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "SYMMETRIC KEY CRYPTOGRAPHY",
                "topics": [
                    {
                        "topicName": "Block ciphers and Data Encryption Standard"
                    },
                    {
                        "topicName": "Block cipher principles"
                    },
                    {
                        "topicName": "The Data Encryption Standard"
                    },
                    {
                        "topicName": "The strength of DES"
                    },
                    {
                        "topicName": "Differential and linear cryptanalysis"
                    },
                    {
                        "topicName": "Block cipher design principles"
                    },
                    {
                        "topicName": "Advanced Encryption Standard"
                    },
                    {
                        "topicName": "Evaluation criteria for AES"
                    },
                    {
                        "topicName": "The AES cipher"
                    },
                    {
                        "topicName": "Multiple encryption and triple DES"
                    },
                    {
                        "topicName": "Block cipher modes of operation"
                    },
                    {
                        "topicName": "Stream ciphers"
                    },
                    {
                        "topicName": "RC4"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "ASYMMETRIC KEY CRYPTOGRAPHY",
                "topics": [
                    {
                        "topicName": "Public key cryptography and RSA"
                    },
                    {
                        "topicName": "Principles of public key cryptosystems"
                    },
                    {
                        "topicName": "The RSA algorithm"
                    },
                    {
                        "topicName": "Key management"
                    },
                    {
                        "topicName": "Diffie Hellman key exchange"
                    },
                    {
                        "topicName": "Elliptic curve arithmetic"
                    },
                    {
                        "topicName": "Elliptic curve cryptography"
                    },
                    {
                        "topicName": "Message authentication and hash functions"
                    },
                    {
                        "topicName": "Authentication requirements"
                    },
                    {
                        "topicName": "Authentication functions"
                    },
                    {
                        "topicName": "Message authentication codes"
                    },
                    {
                        "topicName": "Hash functions"
                    },
                    {
                        "topicName": "Security of hash functions and MACs"
                    },
                    {
                        "topicName": "Secure Hash Algorithm"
                    },
                    {
                        "topicName": "Digital signatures"
                    },
                    {
                        "topicName": "Authentication protocols"
                    },
                    {
                        "topicName": "Digital signature standard"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "SECURITY PRACTICE",
                "topics": [
                    {
                        "topicName": "Authentication applications"
                    },
                    {
                        "topicName": "Kerberos"
                    },
                    {
                        "topicName": "X.509 Authentication service"
                    },
                    {
                        "topicName": "Public key infrastructure"
                    },
                    {
                        "topicName": "Electronic mail security"
                    },
                    {
                        "topicName": "Pretty Good Privacy"
                    },
                    {
                        "topicName": "S/MIME"
                    },
                    {
                        "topicName": "IP security"
                    },
                    {
                        "topicName": "IP security overview"
                    },
                    {
                        "topicName": "IP security architecture"
                    },
                    {
                        "topicName": "Authentication header"
                    },
                    {
                        "topicName": "Encapsulating security payload"
                    },
                    {
                        "topicName": "Combining security associations"
                    },
                    {
                        "topicName": "Key management"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "SYSTEM SECURITY",
                "topics": [
                    {
                        "topicName": "Web security"
                    },
                    {
                        "topicName": "Web security considerations"
                    },
                    {
                        "topicName": "Secure socket layer and transport layer security"
                    },
                    {
                        "topicName": "Secure electronic transaction"
                    },
                    {
                        "topicName": "Intruders"
                    },
                    {
                        "topicName": "Intrusion detection"
                    },
                    {
                        "topicName": "Password management"
                    },
                    {
                        "topicName": "Malicious software"
                    },
                    {
                        "topicName": "Viruses and related threats"
                    },
                    {
                        "topicName": "Virus countermeasures"
                    },
                    {
                        "topicName": "Firewalls"
                    },
                    {
                        "topicName": "Firewall design principles"
                    },
                    {
                        "topicName": "Trusted systems"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Public Key Cryptography",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3551",
        "subjectName": "Distributed Computing",
        "regulation": "R2021",
        "semester": 5,
        "credits": 3,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "INTRODUCTION",
                "topics": [
                    {
                        "topicName": "Introduction to Distributed Systems"
                    },
                    {
                        "topicName": "Characteristics"
                    },
                    {
                        "topicName": "Issues in Distributed Operating Systems"
                    },
                    {
                        "topicName": "Distributed System Models"
                    },
                    {
                        "topicName": "Message Passing"
                    },
                    {
                        "topicName": "RPC"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "COMMUNICATION IN DISTRIBUTED SYSTEM",
                "topics": [
                    {
                        "topicName": "System Model"
                    },
                    {
                        "topicName": "Inter-process Communication"
                    },
                    {
                        "topicName": "API for Internet protocols"
                    },
                    {
                        "topicName": "External data representation and Multicast communication"
                    },
                    {
                        "topicName": "Network virtualization: Overlay networks"
                    },
                    {
                        "topicName": "Case study: MPI"
                    },
                    {
                        "topicName": "Remote Method Invocation and Objects"
                    },
                    {
                        "topicName": "Remote Procedure Call"
                    },
                    {
                        "topicName": "Events and notifications"
                    },
                    {
                        "topicName": "Case study: Java RMI"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "PEER TO PEER SERVICES AND FILE SYSTEM",
                "topics": [
                    {
                        "topicName": "Peer-to-peer Systems"
                    },
                    {
                        "topicName": "Routing overlays"
                    },
                    {
                        "topicName": "File service architecture"
                    },
                    {
                        "topicName": "Sun Network File System"
                    },
                    {
                        "topicName": "HDFS"
                    },
                    {
                        "topicName": "Name Services"
                    },
                    {
                        "topicName": "Domain Name System"
                    },
                    {
                        "topicName": "Directory Services"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "SYNCHRONIZATION AND REPLICATION",
                "topics": [
                    {
                        "topicName": "Clocks, events and process states"
                    },
                    {
                        "topicName": "Synchronizing physical clocks"
                    },
                    {
                        "topicName": "Logical time and logical clocks"
                    },
                    {
                        "topicName": "Global states"
                    },
                    {
                        "topicName": "Coordination and Agreement"
                    },
                    {
                        "topicName": "Distributed mutual exclusion"
                    },
                    {
                        "topicName": "Elections"
                    },
                    {
                        "topicName": "Transactions and Concurrency Control"
                    },
                    {
                        "topicName": "Distributed Transactions"
                    },
                    {
                        "topicName": "Replication"
                    },
                    {
                        "topicName": "Fault-tolerant services"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "PROCESS AND RESOURCE MANAGEMENT",
                "topics": [
                    {
                        "topicName": "Process Management"
                    },
                    {
                        "topicName": "Process Migration"
                    },
                    {
                        "topicName": "Threads"
                    },
                    {
                        "topicName": "Resource Management"
                    },
                    {
                        "topicName": "Distributed Device Management"
                    },
                    {
                        "topicName": "Distributed Device Control"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "Interprocess Communication",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CCS335",
        "subjectName": "Cloud Computing (Elective I)",
        "regulation": "R2021",
        "semester": 5,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "CCS334",
        "subjectName": "Big Data Analytics (Elective II)",
        "regulation": "R2021",
        "semester": 5,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "CCS356",
        "subjectName": "Object Oriented Software Engineering",
        "regulation": "R2021",
        "semester": 6,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "SOFTWARE PROCESS MODELS",
                "topics": [
                    {
                        "topicName": "Software Engineering"
                    },
                    {
                        "topicName": "Process models"
                    },
                    {
                        "topicName": "Waterfall model"
                    },
                    {
                        "topicName": "Incremental model"
                    },
                    {
                        "topicName": "Evolutionary models"
                    },
                    {
                        "topicName": "Spiral model"
                    },
                    {
                        "topicName": "Agile Development"
                    },
                    {
                        "topicName": "Agile Process"
                    },
                    {
                        "topicName": "Extreme Programming"
                    },
                    {
                        "topicName": "Other Agile Process models"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "REQUIREMENTS ANALYSIS AND SPECIFICATION",
                "topics": [
                    {
                        "topicName": "Understanding requirements"
                    },
                    {
                        "topicName": "Requirements modeling"
                    },
                    {
                        "topicName": "Scenario-based methods"
                    },
                    {
                        "topicName": "UML Models"
                    },
                    {
                        "topicName": "Use Case Diagrams"
                    },
                    {
                        "topicName": "Activity Diagrams"
                    },
                    {
                        "topicName": "Requirements definition document"
                    },
                    {
                        "topicName": "Requirements specification"
                    },
                    {
                        "topicName": "Requirements validation"
                    },
                    {
                        "topicName": "Requirements management"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "SOFTWARE DESIGN",
                "topics": [
                    {
                        "topicName": "Design Concepts"
                    },
                    {
                        "topicName": "Design Model"
                    },
                    {
                        "topicName": "Software Architecture"
                    },
                    {
                        "topicName": "Architectural Styles"
                    },
                    {
                        "topicName": "Architectural Design"
                    },
                    {
                        "topicName": "Component-Level Design"
                    },
                    {
                        "topicName": "User Interface Design"
                    },
                    {
                        "topicName": "Design patterns"
                    },
                    {
                        "topicName": "Object-Oriented Design"
                    },
                    {
                        "topicName": "Class diagrams"
                    },
                    {
                        "topicName": "Sequence diagrams"
                    },
                    {
                        "topicName": "State machine diagrams"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "SOFTWARE TESTING",
                "topics": [
                    {
                        "topicName": "Software Testing Fundamentals"
                    },
                    {
                        "topicName": "Internal and External Views of Testing"
                    },
                    {
                        "topicName": "White-Box Testing"
                    },
                    {
                        "topicName": "Basis Path Testing"
                    },
                    {
                        "topicName": "Control Structure Testing"
                    },
                    {
                        "topicName": "Black-Box Testing"
                    },
                    {
                        "topicName": "Integration Testing"
                    },
                    {
                        "topicName": "Validation Testing"
                    },
                    {
                        "topicName": "System Testing"
                    },
                    {
                        "topicName": "Object-Oriented Testing Strategies"
                    },
                    {
                        "topicName": "Test Cases for OO Software"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "SOFTWARE PROJECT MANAGEMENT",
                "topics": [
                    {
                        "topicName": "Software Project Management"
                    },
                    {
                        "topicName": "Estimation"
                    },
                    {
                        "topicName": "Project Scheduling"
                    },
                    {
                        "topicName": "Risk Management"
                    },
                    {
                        "topicName": "Quality Management"
                    },
                    {
                        "topicName": "Software Configuration Management"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "UML Diagrams",
                "weightage": 25,
                "frequency": "Very High"
            }
        ],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "CS3691",
        "subjectName": "Embedded Systems and IOT",
        "regulation": "R2021",
        "semester": 6,
        "credits": 4,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "EMBEDDED SYSTEMS FOUNDATION",
                "topics": [
                    {
                        "topicName": "Introduction to Embedded Systems"
                    },
                    {
                        "topicName": "Architecture of Embedded Systems"
                    },
                    {
                        "topicName": "Microprocessors vs Microcontrollers"
                    },
                    {
                        "topicName": "Design Process in Embedded System"
                    },
                    {
                        "topicName": "Sensors and Actuators"
                    },
                    {
                        "topicName": "I/O Ports"
                    },
                    {
                        "topicName": "Timers"
                    },
                    {
                        "topicName": "Interrupts"
                    },
                    {
                        "topicName": "ADC/DAC"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 2,
                "unitTitle": "ARM ARCHITECTURE",
                "topics": [
                    {
                        "topicName": "ARM Architecture"
                    },
                    {
                        "topicName": "ARM Instruction Set"
                    },
                    {
                        "topicName": "Thumb Instruction Set"
                    },
                    {
                        "topicName": "Registers"
                    },
                    {
                        "topicName": "Pipeline"
                    },
                    {
                        "topicName": "Exceptions and Interrupts"
                    },
                    {
                        "topicName": "Memory Management"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 3,
                "unitTitle": "EMBEDDED PROGRAMMING",
                "topics": [
                    {
                        "topicName": "C Programming for Embedded Systems"
                    },
                    {
                        "topicName": "Assembly Language Programming"
                    },
                    {
                        "topicName": "Mixing C and Assembly"
                    },
                    {
                        "topicName": "RTOS Concepts"
                    },
                    {
                        "topicName": "Task Management"
                    },
                    {
                        "topicName": "Inter-Task Communication"
                    },
                    {
                        "topicName": "Semaphores"
                    },
                    {
                        "topicName": "Message Queues"
                    },
                    {
                        "topicName": "Mailboxes"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 4,
                "unitTitle": "IOT FOUNDATION",
                "topics": [
                    {
                        "topicName": "Introduction to IoT"
                    },
                    {
                        "topicName": "IoT Architecture"
                    },
                    {
                        "topicName": "IoT Enabling Technologies"
                    },
                    {
                        "topicName": "IoT Levels"
                    },
                    {
                        "topicName": "M2M"
                    },
                    {
                        "topicName": "IoT vs M2M"
                    },
                    {
                        "topicName": "Sensors in IoT"
                    },
                    {
                        "topicName": "Actuators in IoT"
                    }
                ],
                "hours": 9
            },
            {
                "unitNumber": 5,
                "unitTitle": "IOT PROTOCOLS AND APPLICATIONS",
                "topics": [
                    {
                        "topicName": "IoT Protocols: MQTT, CoAP, AMQP"
                    },
                    {
                        "topicName": "Communication Protocols: Wi-Fi, Bluetooth, Zigbee"
                    },
                    {
                        "topicName": "IoT Security"
                    },
                    {
                        "topicName": "Cloud Computing in IoT"
                    },
                    {
                        "topicName": "IoT Applications: Smart Home, Smart City, Smart Agriculture, Healthcare"
                    }
                ],
                "hours": 9
            }
        ],
        "importantTopics": [
            {
                "topic": "IoT Architecture",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CCS341",
        "subjectName": "Data Warehousing and Data Mining (Elective III)",
        "regulation": "R2021",
        "semester": 6,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "CCS349",
        "subjectName": "Image Processing (Elective IV)",
        "regulation": "R2021",
        "semester": 6,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "CCS366",
        "subjectName": "Software Testing (Elective V)",
        "regulation": "R2021",
        "semester": 6,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "CCS375",
        "subjectName": "Web Technologies (Elective VI)",
        "regulation": "R2021",
        "semester": 6,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "ELECTIVE"
    },
    {
        "subjectCode": "GE3791",
        "subjectName": "Human Values and Ethics",
        "regulation": "R2021",
        "semester": 7,
        "credits": 2,
        "units": [
            {
                "unitNumber": 1,
                "unitTitle": "DEMOCRATIC VALUES",
                "topics": [
                    {
                        "topicName": "Understanding Democratic values"
                    },
                    {
                        "topicName": "World Democracies"
                    },
                    {
                        "topicName": "John Stuart Mills On Liberty"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 2,
                "unitTitle": "SECULAR VALUES",
                "topics": [
                    {
                        "topicName": "Understanding Secular values"
                    },
                    {
                        "topicName": "Interpretation of secularism in Indian context"
                    },
                    {
                        "topicName": "Disassociation of state from religion"
                    },
                    {
                        "topicName": "Acceptance of all faiths"
                    },
                    {
                        "topicName": "Encouraging non-discriminatory practices"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 3,
                "unitTitle": "SCIENTIFIC VALUES",
                "topics": [
                    {
                        "topicName": "Scientific thinking and method"
                    },
                    {
                        "topicName": "Inductive and Deductive thinking"
                    },
                    {
                        "topicName": "Proposing and testing Hypothesis"
                    },
                    {
                        "topicName": "Validating facts using evidence based approach"
                    },
                    {
                        "topicName": "Skepticism and Empiricism"
                    },
                    {
                        "topicName": "Rationalism and Scientific Temper"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 4,
                "unitTitle": "SOCIAL ETHICS",
                "topics": [
                    {
                        "topicName": "Application of ethical reasoning to social problems"
                    },
                    {
                        "topicName": "Gender bias and issues"
                    },
                    {
                        "topicName": "Gender violence"
                    },
                    {
                        "topicName": "Social discrimination"
                    },
                    {
                        "topicName": "Constitutional protection and policies"
                    },
                    {
                        "topicName": "Inclusive practices"
                    }
                ],
                "hours": 6
            },
            {
                "unitNumber": 5,
                "unitTitle": "SCIENTIFIC ETHICS",
                "topics": [
                    {
                        "topicName": "Transparency and Fairness in scientific pursuits"
                    },
                    {
                        "topicName": "Scientific inventions for the betterment of society"
                    },
                    {
                        "topicName": "Unfair application of scientific inventions"
                    },
                    {
                        "topicName": "Role and Responsibility of Scientist"
                    }
                ],
                "hours": 6
            }
        ],
        "importantTopics": [
            {
                "topic": "Engineering Ethics",
                "weightage": 20,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3711",
        "subjectName": "Summer Internship",
        "regulation": "R2021",
        "semester": 7,
        "credits": 2,
        "units": [],
        "importantTopics": [],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "GE3752",
        "subjectName": "Total Quality Management",
        "regulation": "R2021",
        "semester": 7,
        "credits": 3,
        "units": [],
        "importantTopics": [],
        "subjectType": "CORE"
    },
    {
        "subjectCode": "CS3811",
        "subjectName": "Project Work / Internship",
        "regulation": "R2021",
        "semester": 8,
        "credits": 10,
        "units": [],
        "importantTopics": [
            {
                "topic": "Project Implementation",
                "weightage": 100,
                "frequency": "High"
            }
        ],
        "subjectType": "CORE"
    }
];

const studentData = [
    {
        "studentId": "CS21001",
        "name": "Rajesh Kumar",
        "email": "rajesh@annauniv.edu",
        "password": "password123",
        "phone": "9876543210",
        "semester": 3,
        "batch": "2021-2025",
        "college": "Anna University - Chennai",
        "department": "Computer Science Engineering",
        "preferredLanguage": "mixed"
    },
    {
        "studentId": "CS21002",
        "name": "Priya Devi",
        "email": "priya@annauniv.edu",
        "password": "password123",
        "phone": "9876543211",
        "semester": 5,
        "batch": "2021-2025",
        "college": "Anna University - Chennai",
        "department": "Computer Science Engineering",
        "preferredLanguage": "ta"
    },
    {
        "studentId": "GOOGLE001",
        "name": "Test Google User",
        "email": "tamiledu.student@gmail.com",
        "password": "password123",
        "phone": "9876543299",
        "semester": 1,
        "batch": "2024-2028",
        "college": "Anna University",
        "department": "Information Technology",
        "preferredLanguage": "en"
    }
];


async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamiledu-ai');
        console.log('✅ Connected to MongoDB');
        console.log('🗑️  Clearing existing data...');
        await Syllabus.deleteMany({});
        await Student.deleteMany({});
        console.log('📚 Seeding syllabus data...');
        await Syllabus.insertMany(syllabusData);
        console.log('👨‍🎓 Seeding student data...');
        await Student.create(studentData);
        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

// seedDatabase();
module.exports = { syllabusData };

