const mongoose = require('mongoose');
const Syllabus = require('../../models/Syllabus');
const Student = require('../../models/Student');
require('dotenv').config();

// Anna University R2021 Syllabus Data
const syllabusData = [
    // --- SEMESTER 1 ---
    {
        subjectCode: 'IP3151',
        subjectName: 'Induction Programme',
        regulation: 'R2021',
        semester: 1,
        credits: 0,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'HS3151',
        subjectName: 'Professional English - I',
        regulation: 'R2021',
        semester: 1,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Language and Communication', topics: [{ topicName: 'Reading Skills' }], hours: 9 }],
        importantTopics: [{ topic: 'Tenses', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'MA3151',
        subjectName: 'Matrices and Calculus',
        regulation: 'R2021',
        semester: 1,
        credits: 4,
        units: [
            {
                unitNumber: 1,
                unitTitle: "Matrices",
                topics: [
                    { topicName: "Matrix Operations and Properties" }, { topicName: "Rank of a Matrix" }, { topicName: "Inverse of Matrix" },
                    { topicName: "System of Linear Equations" }, { topicName: "Eigenvalues and Eigenvectors" },
                    { topicName: "Cayley-Hamilton Theorem" }, { topicName: "Diagonalization" }
                ],
                hours: 12
            },
            {
                unitNumber: 2,
                unitTitle: "Differential Calculus",
                topics: [
                    { topicName: "Limits and Continuity" }, { topicName: "Differentiation Techniques" }, { topicName: "Partial Derivatives" },
                    { topicName: "Total Derivative" }, { topicName: "Chain Rule" }, { topicName: "Implicit Differentiation" }, { topicName: "Taylor Series Expansion" }
                ],
                hours: 12
            },
            {
                unitNumber: 3,
                unitTitle: "Functions of Several Variables",
                topics: [
                    { topicName: "Maxima and Minima" }, { topicName: "Lagrange Multipliers" }, { topicName: "Jacobians" },
                    { topicName: "Gradient Vector" }, { topicName: "Directional Derivatives" }, { topicName: "Critical Points" }
                ],
                hours: 12
            },
            {
                unitNumber: 4,
                unitTitle: "Integral Calculus",
                topics: [
                    { topicName: "Multiple Integrals" }, { topicName: "Double Integrals" }, { topicName: "Triple Integrals" },
                    { topicName: "Change of Variables" }, { topicName: "Applications of Integration" }, { topicName: "Volume Calculation" }
                ],
                hours: 12
            },
            {
                unitNumber: 5,
                unitTitle: "Vector Calculus",
                topics: [
                    { topicName: "Gradient" }, { topicName: "Divergence" }, { topicName: "Curl" }, { topicName: "Line Integrals" },
                    { topicName: "Surface Integrals" }, { topicName: "Green's Theorem" }, { topicName: "Stokes Theorem" }
                ],
                hours: 12
            }
        ],
        importantTopics: [{ topic: 'Cayley-Hamilton Theorem', weightage: 20, frequency: 'Very High' }]
    },
    {
        subjectCode: 'PH3151',
        subjectName: 'Engineering Physics',
        regulation: 'R2021',
        semester: 1,
        credits: 3,
        units: [
            {
                unitNumber: 1,
                unitTitle: "Properties of Matter",
                topics: [
                    { topicName: "Elasticity and Stress-Strain" }, { topicName: "Crystal Physics and Structure" },
                    { topicName: "Dielectric Materials" }, { topicName: "Magnetic Properties" }, { topicName: "Superconductivity Basics" }
                ],
                hours: 9
            },
            {
                unitNumber: 2,
                unitTitle: "Waves and Optics",
                topics: [
                    { topicName: "Interference Phenomenon" }, { topicName: "Diffraction Patterns" }, { topicName: "Polarization of Light" },
                    { topicName: "Fiber Optics Technology" }, { topicName: "Laser Fundamentals" }
                ],
                hours: 9
            },
            {
                unitNumber: 3,
                unitTitle: "Thermal Physics",
                topics: [
                    { topicName: "Heat Transfer Mechanisms" }, { topicName: "Thermodynamics Laws" }, { topicName: "Quantum Theory Basics" },
                    { topicName: "Black Body Radiation" }, { topicName: "Entropy and Statistical Mechanics" }
                ],
                hours: 9
            },
            {
                unitNumber: 4,
                unitTitle: "Acoustics and Ultrasonics",
                topics: [
                    { topicName: "Sound Wave Properties" }, { topicName: "Ultrasonics Applications" }, { topicName: "Acoustic Properties" },
                    { topicName: "Reverberation and Absorption" }
                ],
                hours: 9
            },
            {
                unitNumber: 5,
                unitTitle: "Semiconductor Physics",
                topics: [
                    { topicName: "Band Theory of Solids" }, { topicName: "P-N Junction Diode" }, { topicName: "Transistor Operation" },
                    { topicName: "Photodiodes and LEDs" }, { topicName: "Semiconductor Applications" }
                ],
                hours: 9
            }
        ],
        importantTopics: [{ topic: 'Elasticity', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CY3151',
        subjectName: 'Engineering Chemistry',
        regulation: 'R2021',
        semester: 1,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Water Technology', topics: [{ topicName: 'Hardness' }], hours: 9 }],
        importantTopics: [{ topic: 'Hardness of Water', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'GE3151',
        subjectName: 'Problem Solving and Python Programming',
        regulation: 'R2021',
        semester: 1,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Computational Thinking', topics: [{ topicName: 'Algorithms' }], hours: 9 }],
        importantTopics: [{ topic: 'Algorithmic Problem Solving', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'GE3152',
        subjectName: 'Heritage of Tamils',
        regulation: 'R2021',
        semester: 1,
        credits: 1,
        units: [{ unitNumber: 1, unitTitle: 'Language and Heritage', topics: [{ topicName: 'Language Family' }], hours: 3 }],
        importantTopics: []
    },
    {
        subjectCode: 'GE3171',
        subjectName: 'Problem Solving and Python Programming Laboratory',
        regulation: 'R2021',
        semester: 1,
        credits: 2,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'BS3171',
        subjectName: 'Physics and Chemistry Laboratory',
        regulation: 'R2021',
        semester: 1,
        credits: 2,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'GE3172',
        subjectName: 'English Laboratory',
        regulation: 'R2021',
        semester: 1,
        credits: 1,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 2 ---
    {
        subjectCode: 'HS3251',
        subjectName: 'Professional English - II',
        regulation: 'R2021',
        semester: 2,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Technical English', topics: [{ topicName: 'Listening' }], hours: 9 }],
        importantTopics: [{ topic: 'Report Writing', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'MA3251',
        subjectName: 'Statistics and Numerical Methods',
        regulation: 'R2021',
        semester: 2,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Testing of Hypothesis', topics: [{ topicName: 'T-Test' }], hours: 12 }],
        importantTopics: [{ topic: 'Sampling Distributions', weightage: 25, frequency: 'Very High' }]
    },
    {
        subjectCode: 'PH3256',
        subjectName: 'Physics for Information Science',
        regulation: 'R2021',
        semester: 2,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Electrical Properties', topics: [{ topicName: 'Conductors' }], hours: 9 }],
        importantTopics: [{ topic: 'Semiconductor Physics', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'BE3251',
        subjectName: 'Basic Electrical and Electronics Engineering',
        regulation: 'R2021',
        semester: 2,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Electrical Circuits', topics: [{ topicName: 'Ohm’s Law' }], hours: 9 }],
        importantTopics: [{ topic: 'AC Circuits', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'GE3251',
        subjectName: 'Engineering Graphics',
        regulation: 'R2021',
        semester: 2,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Plane Curves', topics: [{ topicName: 'Conics' }], hours: 12 }],
        importantTopics: [{ topic: 'Projection of Solids', weightage: 30, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3251',
        subjectName: 'Programming in C',
        regulation: 'R2021',
        semester: 2,
        credits: 3,
        units: [
            {
                unitNumber: 1,
                unitTitle: 'Basics of C',
                topics: [
                    { topicName: 'Structure of C', difficulty: 'easy' },
                    { topicName: 'Data Types', difficulty: 'easy' },
                    { topicName: 'Variables and Constants', difficulty: 'easy' },
                    { topicName: 'Operators', difficulty: 'medium' }
                ],
                hours: 9
            },
            {
                unitNumber: 2,
                unitTitle: 'Arrays and Strings',
                topics: [
                    { topicName: '1D Arrays', difficulty: 'medium' },
                    { topicName: '2D Arrays', difficulty: 'hard' },
                    { topicName: 'String Operations', difficulty: 'medium' }
                ],
                hours: 9
            },
            {
                unitNumber: 3,
                unitTitle: 'Functions and Pointers',
                topics: [
                    { topicName: 'Function Declaration', difficulty: 'medium' },
                    { topicName: 'Call by Value vs Reference', difficulty: 'hard' },
                    { topicName: 'Pointers Introduction', difficulty: 'hard' }
                ],
                hours: 9
            },
            {
                unitNumber: 4,
                unitTitle: 'Structures',
                topics: [
                    { topicName: 'Defining Structures', difficulty: 'medium' },
                    { topicName: 'Nested Structures', difficulty: 'hard' }
                ],
                hours: 9
            },
            {
                unitNumber: 5,
                unitTitle: 'File Processing',
                topics: [
                    { topicName: 'File Open and Close', difficulty: 'medium' },
                    { topicName: 'Reading and Writing Files', difficulty: 'hard' }
                ],
                hours: 9
            }
        ],
        importantTopics: [{ topic: 'Pointers', weightage: 25, frequency: 'High' }]
    },
    {
        subjectCode: 'GE3252',
        subjectName: 'Tamils and Technology',
        regulation: 'R2021',
        semester: 2,
        credits: 1,
        units: [{ unitNumber: 1, unitTitle: 'Weaving and Textile', topics: [{ topicName: 'Ancient Technology' }], hours: 3 }],
        importantTopics: []
    },
    {
        subjectCode: 'GE3271',
        subjectName: 'Engineering Practices Laboratory',
        regulation: 'R2021',
        semester: 2,
        credits: 2,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'CS3271',
        subjectName: 'Programming in C Laboratory',
        regulation: 'R2021',
        semester: 2,
        credits: 2,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 3 ---
    {
        subjectCode: 'MA3354',
        subjectName: 'Discrete Mathematics',
        regulation: 'R2021',
        semester: 3,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Logic and Proofs', topics: [{ topicName: 'Propositional Logic' }], hours: 12 }],
        importantTopics: [{ topic: 'Graph Theory', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3351',
        subjectName: 'Digital Principles and Computer Organization',
        regulation: 'R2021',
        semester: 3,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Digital Fundamentals', topics: [{ topicName: 'Number Systems' }], hours: 12 }],
        importantTopics: [{ topic: 'Memory Organization', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3352',
        subjectName: 'Foundations of Data Science',
        regulation: 'R2021',
        semester: 3,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Introduction', topics: [{ topicName: 'Data Science Process' }], hours: 9 }],
        importantTopics: [{ topic: 'Exploratory Data Analysis', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3301',
        subjectName: 'Data Structures',
        regulation: 'R2021',
        semester: 3,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'List', topics: [{ topicName: 'Abstract Data Types' }], hours: 9 }],
        importantTopics: [{ topic: 'Graph Traversals', weightage: 25, frequency: 'Very High' }]
    },
    {
        subjectCode: 'CS3391',
        subjectName: 'Object Oriented Programming',
        regulation: 'R2021',
        semester: 3,
        credits: 3,
        units: [
            {
                unitNumber: 1,
                unitTitle: "Introduction to OOP and Java",
                topics: [
                    { topicName: "OOP Concepts - Abstraction and Encapsulation" }, { topicName: "Inheritance and Polymorphism" },
                    { topicName: "Java Programming Basics" }, { topicName: "Data Types and Variables" }, { topicName: "Operators and Expressions" },
                    { topicName: "Control Flow Statements" }, { topicName: "Methods and Parameters" }, { topicName: "Arrays in Java" }
                ],
                hours: 9
            },
            {
                unitNumber: 2,
                unitTitle: "Inheritance and Interfaces",
                topics: [
                    { topicName: "Single Inheritance" }, { topicName: "Multilevel Inheritance" }, { topicName: "Hierarchical Inheritance" },
                    { topicName: "Interface Declaration and Implementation" }, { topicName: "Abstract Classes" },
                    { topicName: "Super Keyword Usage" }, { topicName: "Method Overriding" }, { topicName: "Dynamic Method Dispatch" }
                ],
                hours: 9
            },
            {
                unitNumber: 3,
                unitTitle: "Packages and Exception Handling",
                topics: [
                    { topicName: "Package Creation and Usage" }, { topicName: "Access Modifiers - Public Private Protected" },
                    { topicName: "Exception Handling Basics" }, { topicName: "Try-Catch Blocks" }, { topicName: "Throw and Throws Keywords" },
                    { topicName: "Custom Exception Classes" }, { topicName: "Finally Block" }, { topicName: "Chained Exceptions" }
                ],
                hours: 9
            },
            {
                unitNumber: 4,
                unitTitle: "Multithreading and Synchronization",
                topics: [
                    { topicName: "Thread Life Cycle" }, { topicName: "Creating Threads - Runnable and Thread" },
                    { topicName: "Thread Synchronization" }, { topicName: "Inter-thread Communication" },
                    { topicName: "Thread Priority Management" }, { topicName: "Deadlock Handling" }, { topicName: "Thread Pools" }, { topicName: "Concurrent Collections" }
                ],
                hours: 9
            },
            {
                unitNumber: 5,
                unitTitle: "Collections and File I/O",
                topics: [
                    { topicName: "ArrayList and LinkedList" }, { topicName: "HashMap and HashSet" }, { topicName: "Iterator and ListIterator" },
                    { topicName: "File Input Output Operations" }, { topicName: "Byte Streams and Character Streams" },
                    { topicName: "Serialization and Deserialization" }, { topicName: "BufferedReader and BufferedWriter" }
                ],
                hours: 9
            }
        ],
        importantTopics: [{ topic: 'Inheritance and Polymorphism', weightage: 25, frequency: 'Very High' }]
    },
    {
        subjectCode: 'CS3311',
        subjectName: 'Data Structures Laboratory',
        regulation: 'R2021',
        semester: 3,
        credits: 1.5,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'CS3381',
        subjectName: 'Object Oriented Programming Laboratory',
        regulation: 'R2021',
        semester: 3,
        credits: 1.5,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'CS3361',
        subjectName: 'Data Science Laboratory',
        regulation: 'R2021',
        semester: 3,
        credits: 1.5,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 4 ---
    {
        subjectCode: 'CS3452',
        subjectName: 'Theory of Computation',
        regulation: 'R2021',
        semester: 4,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Automata Fundamentals', topics: [{ topicName: 'Finite Automata' }], hours: 9 }],
        importantTopics: [{ topic: 'Turing Machines', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3491',
        subjectName: 'Artificial Intelligence and Machine Learning',
        regulation: 'R2021',
        semester: 4,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Problem Solving', topics: [{ topicName: 'Search Algorithms' }], hours: 12 }],
        importantTopics: [{ topic: 'Supervised Learning', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3492',
        subjectName: 'Database Management Systems',
        regulation: 'R2021',
        semester: 4,
        credits: 3,
        units: [
            {
                unitNumber: 1,
                unitTitle: "Introduction to DBMS",
                topics: [
                    { topicName: "Database System Concepts" }, { topicName: "DBMS Architecture - Two-tier Three-tier" },
                    { topicName: "Data Models - Hierarchical Network Relational" }, { topicName: "ER Model and ER Diagrams" },
                    { topicName: "Entities Attributes Relationships" }, { topicName: "Relational Model Basics" },
                    { topicName: "Keys - Primary Foreign Candidate Super" }
                ],
                hours: 9
            },
            {
                unitNumber: 2,
                unitTitle: "SQL and Queries",
                topics: [
                    { topicName: "DDL Commands - CREATE ALTER DROP" }, { topicName: "DML Commands - INSERT UPDATE DELETE" },
                    { topicName: "SELECT Statement and Clauses" }, { topicName: "Joins - Inner Left Right Full Outer" },
                    { topicName: "Aggregate Functions - COUNT SUM AVG MIN MAX" }, { topicName: "GROUP BY and HAVING Clauses" },
                    { topicName: "Subqueries - Nested Correlated" }, { topicName: "Views and Indexes" }
                ],
                hours: 9
            },
            {
                unitNumber: 3,
                unitTitle: "Normalization",
                topics: [
                    { topicName: "Functional Dependencies" }, { topicName: "First Normal Form - 1NF" }, { topicName: "Second Normal Form - 2NF" },
                    { topicName: "Third Normal Form - 3NF" }, { topicName: "Boyce-Codd Normal Form - BCNF" },
                    { topicName: "Fourth Normal Form - 4NF" }, { topicName: "Decomposition - Lossless Lossy" }, { topicName: "Dependency Preservation" }
                ],
                hours: 9
            },
            {
                unitNumber: 4,
                unitTitle: "Transaction Management",
                topics: [
                    { topicName: "ACID Properties - Atomicity Consistency Isolation Durability" },
                    { topicName: "Transaction States" }, { topicName: "Concurrency Control Techniques" },
                    { topicName: "Locking Mechanisms - Shared Exclusive" }, { topicName: "Two-Phase Locking Protocol" },
                    { topicName: "Deadlock Detection and Prevention" }, { topicName: "Recovery Techniques" }, { topicName: "Log-based Recovery" }
                ],
                hours: 9
            },
            {
                unitNumber: 5,
                unitTitle: "NoSQL Databases",
                topics: [
                    { topicName: "NoSQL Concepts and Types" }, { topicName: "MongoDB Basics" }, { topicName: "Document Database Structure" },
                    { topicName: "CRUD Operations in MongoDB" }, { topicName: "Aggregation Pipeline" }, { topicName: "Indexing in MongoDB" },
                    { topicName: "CAP Theorem" }, { topicName: "NoSQL vs SQL Comparison" }
                ],
                hours: 9
            }
        ],
        importantTopics: [{ topic: 'Normalization', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3401',
        subjectName: 'Algorithms',
        regulation: 'R2021',
        semester: 4,
        credits: 4,
        units: [
            {
                unitNumber: 1,
                unitTitle: "Arrays and Linked Lists",
                topics: [
                    { topicName: "Array Data Structure" }, { topicName: "Array Operations - Insertion Deletion Traversal" },
                    { topicName: "Singly Linked List" }, { topicName: "Doubly Linked List" }, { topicName: "Circular Linked List" },
                    { topicName: "Applications of Linked Lists" }, { topicName: "Polynomial Representation" }
                ],
                hours: 9
            },
            {
                unitNumber: 2,
                unitTitle: "Stacks and Queues",
                topics: [
                    { topicName: "Stack Data Structure - LIFO" }, { topicName: "Stack Operations - Push Pop Peek" },
                    { topicName: "Infix to Postfix Conversion" }, { topicName: "Expression Evaluation" },
                    { topicName: "Queue Data Structure - FIFO" }, { topicName: "Circular Queue Implementation" },
                    { topicName: "Priority Queue" }, { topicName: "Double Ended Queue - Deque" }
                ],
                hours: 9
            },
            {
                unitNumber: 3,
                unitTitle: "Trees and Binary Search Trees",
                topics: [
                    { topicName: "Tree Terminology - Root Node Leaf Height" }, { topicName: "Binary Tree Structure" },
                    { topicName: "Binary Search Tree - BST" }, { topicName: "Tree Traversals - Inorder Preorder Postorder" },
                    { topicName: "BST Operations - Insertion Deletion Search" }, { topicName: "AVL Trees and Balancing" },
                    { topicName: "B-Trees and B+ Trees" }
                ],
                hours: 9
            },
            {
                unitNumber: 4,
                unitTitle: "Graphs and Graph Algorithms",
                topics: [
                    { topicName: "Graph Representation - Adjacency Matrix List" }, { topicName: "Breadth First Search - BFS" },
                    { topicName: "Depth First Search - DFS" }, { topicName: "Minimum Spanning Tree - MST" },
                    { topicName: "Kruskal's Algorithm" }, { topicName: "Prim's Algorithm" }, { topicName: "Shortest Path - Dijkstra's Algorithm" },
                    { topicName: "Bellman-Ford Algorithm" }
                ],
                hours: 9
            },
            {
                unitNumber: 5,
                unitTitle: "Sorting and Searching",
                topics: [
                    { topicName: "Bubble Sort Algorithm" }, { topicName: "Selection Sort" }, { topicName: "Insertion Sort" },
                    { topicName: "Merge Sort - Divide and Conquer" }, { topicName: "Quick Sort Algorithm" }, { topicName: "Heap Sort" },
                    { topicName: "Linear Search" }, { topicName: "Binary Search Algorithm" }, { topicName: "Hashing Techniques" }
                ],
                hours: 9
            }
        ],
        importantTopics: [{ topic: 'Dynamic Programming', weightage: 25, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3451',
        subjectName: 'Introduction to Operating Systems',
        regulation: 'R2021',
        semester: 4,
        credits: 3,
        units: [
            {
                unitNumber: 1,
                unitTitle: "Introduction to OS",
                topics: [
                    { topicName: "Operating System Functions" }, { topicName: "Types of Operating Systems" },
                    { topicName: "System Calls and API" }, { topicName: "Process Concept" }, { topicName: "Process States and Transitions" },
                    { topicName: "Process Control Block - PCB" }, { topicName: "Context Switching Mechanism" }
                ],
                hours: 9
            },
            {
                unitNumber: 2,
                unitTitle: "CPU Scheduling",
                topics: [
                    { topicName: "First Come First Serve - FCFS" }, { topicName: "Shortest Job First - SJF" },
                    { topicName: "Round Robin Scheduling" }, { topicName: "Priority Scheduling" }, { topicName: "Multilevel Queue Scheduling" },
                    { topicName: "Multilevel Feedback Queue" }, { topicName: "Scheduling Criteria and Metrics" }, { topicName: "Gantt Chart Representation" }
                ],
                hours: 9
            },
            {
                unitNumber: 3,
                unitTitle: "Memory Management",
                topics: [
                    { topicName: "Paging Concept and Implementation" }, { topicName: "Segmentation Techniques" },
                    { topicName: "Virtual Memory Management" }, { topicName: "Page Replacement Algorithms" },
                    { topicName: "FIFO Page Replacement" }, { topicName: "LRU - Least Recently Used" },
                    { topicName: "Optimal Page Replacement" }, { topicName: "Thrashing and Working Set Model" }
                ],
                hours: 9
            },
            {
                unitNumber: 4,
                unitTitle: "Deadlock Management",
                topics: [
                    { topicName: "Deadlock Conditions - Mutual Exclusion Hold and Wait" },
                    { topicName: "Resource Allocation Graph" }, { topicName: "Deadlock Prevention Strategies" },
                    { topicName: "Deadlock Avoidance Techniques" }, { topicName: "Banker's Algorithm" },
                    { topicName: "Deadlock Detection Methods" }, { topicName: "Recovery from Deadlock" }
                ],
                hours: 9
            },
            {
                unitNumber: 5,
                unitTitle: "File Systems and Disk Management",
                topics: [
                    { topicName: "File System Concepts" }, { topicName: "File Operations and Attributes" },
                    { topicName: "Directory Structure - Single Level Two Level Tree" },
                    { topicName: "File Allocation Methods - Contiguous Linked Indexed" },
                    { topicName: "Disk Scheduling Algorithms" }, { topicName: "FCFS Disk Scheduling" },
                    { topicName: "SCAN and C-SCAN Algorithms" }, { topicName: "LOOK and C-LOOK Algorithms" }
                ],
                hours: 9
            }
        ],
        importantTopics: [{ topic: 'Process Scheduling', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'GE3451',
        subjectName: 'Environmental Sciences and Sustainability',
        regulation: 'R2021',
        semester: 4,
        credits: 2,
        units: [{ unitNumber: 1, unitTitle: 'Environment and Ecosystem', topics: [{ topicName: 'Biodiversity' }], hours: 6 }],
        importantTopics: [{ topic: 'Pollution Control', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3461',
        subjectName: 'Operating Systems Laboratory',
        regulation: 'R2021',
        semester: 4,
        credits: 1.5,
        units: [],
        importantTopics: []
    },
    {
        subjectCode: 'CS3481',
        subjectName: 'Database Management Systems Laboratory',
        regulation: 'R2021',
        semester: 4,
        credits: 1.5,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 5 ---
    {
        subjectCode: 'CS3591',
        subjectName: 'Computer Networks',
        regulation: 'R2021',
        semester: 5,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Fundamentals', topics: [{ topicName: 'OSI Reference Model' }], hours: 12 }],
        importantTopics: [{ topic: 'Routing Algorithms', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3501',
        subjectName: 'Compiler Design',
        regulation: 'R2021',
        semester: 5,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Lexical Analysis', topics: [{ topicName: 'Tokens' }], hours: 12 }],
        importantTopics: [{ topic: 'Parsing Techniques', weightage: 25, frequency: 'High' }]
    },
    {
        subjectCode: 'CB3491',
        subjectName: 'Cryptography and Cyber Security',
        regulation: 'R2021',
        semester: 5,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Introduction', topics: [{ topicName: 'Security Trends' }], hours: 9 }],
        importantTopics: [{ topic: 'Public Key Cryptography', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3551',
        subjectName: 'Distributed Computing',
        regulation: 'R2021',
        semester: 5,
        credits: 3,
        units: [{ unitNumber: 1, unitTitle: 'Introduction', topics: [{ topicName: 'Architectures' }], hours: 9 }],
        importantTopics: [{ topic: 'Interprocess Communication', weightage: 20, frequency: 'High' }]
    },
    // Professional Elective I (Select One)
    {
        subjectCode: 'CCS335',
        subjectName: 'Cloud Computing (Elective I)',
        regulation: 'R2021',
        semester: 5,
        credits: 3,
        units: [],
        importantTopics: []
    },
    // Professional Elective II (Select One)
    {
        subjectCode: 'CCS334',
        subjectName: 'Big Data Analytics (Elective II)',
        regulation: 'R2021',
        semester: 5,
        credits: 3,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 6 ---
    {
        subjectCode: 'CCS356',
        subjectName: 'Object Oriented Software Engineering',
        regulation: 'R2021',
        semester: 6,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Software Process', topics: [{ topicName: 'Agile' }], hours: 12 }],
        importantTopics: [{ topic: 'UML Diagrams', weightage: 25, frequency: 'Very High' }]
    },
    {
        subjectCode: 'CS3691',
        subjectName: 'Embedded Systems and IOT',
        regulation: 'R2021',
        semester: 6,
        credits: 4,
        units: [{ unitNumber: 1, unitTitle: 'Introduction to Embedded Systems', topics: [{ topicName: 'Microcontrollers' }], hours: 12 }],
        importantTopics: [{ topic: 'IoT Architecture', weightage: 20, frequency: 'High' }]
    },
    // Professional Elective III
    {
        subjectCode: 'CCS341',
        subjectName: 'Data Warehousing and Data Mining (Elective III)',
        regulation: 'R2021',
        semester: 6,
        credits: 3,
        units: [],
        importantTopics: []
    },
    // Professional Elective IV
    {
        subjectCode: 'CCS349',
        subjectName: 'Image Processing (Elective IV)',
        regulation: 'R2021',
        semester: 6,
        credits: 3,
        units: [],
        importantTopics: []
    },
    // Professional Elective V
    {
        subjectCode: 'CCS366',
        subjectName: 'Software Testing (Elective V)',
        regulation: 'R2021',
        semester: 6,
        credits: 3,
        units: [],
        importantTopics: []
    },
    // Professional Elective VI
    {
        subjectCode: 'CCS375',
        subjectName: 'Web Technologies (Elective VI)',
        regulation: 'R2021',
        semester: 6,
        credits: 3,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 7 ---
    {
        subjectCode: 'GE3791',
        subjectName: 'Human Values and Ethics',
        regulation: 'R2021',
        semester: 7,
        credits: 2,
        units: [{ unitNumber: 1, unitTitle: 'Human Values', topics: [{ topicName: 'Integrity' }], hours: 6 }],
        importantTopics: [{ topic: 'Engineering Ethics', weightage: 20, frequency: 'High' }]
    },
    {
        subjectCode: 'CS3711',
        subjectName: 'Summer Internship',
        regulation: 'R2021',
        semester: 7,
        credits: 2,
        units: [],
        importantTopics: []
    },
    // Management Elective
    {
        subjectCode: 'GE3752',
        subjectName: 'Total Quality Management',
        regulation: 'R2021',
        semester: 7,
        credits: 3,
        units: [],
        importantTopics: []
    },

    // --- SEMESTER 8 ---
    {
        subjectCode: 'CS3811',
        subjectName: 'Project Work / Internship',
        regulation: 'R2021',
        semester: 8,
        credits: 10,
        units: [],
        importantTopics: [{ topic: 'Project Implementation', weightage: 100, frequency: 'High' }]
    }
];

// Sample student data
const studentData = [
    {
        studentId: 'CS21001',
        name: 'Rajesh Kumar',
        email: 'rajesh@annauniv.edu',
        password: 'password123',
        phone: '9876543210',
        semester: 3,
        batch: '2021-2025',
        college: 'Anna University - Chennai',
        department: 'Computer Science Engineering',
        preferredLanguage: 'mixed'
    },
    {
        studentId: 'CS21002',
        name: 'Priya Devi',
        email: 'priya@annauniv.edu',
        password: 'password123',
        phone: '9876543211',
        semester: 5,
        batch: '2021-2025',
        college: 'Anna University - Chennai',
        department: 'Computer Science Engineering',
        preferredLanguage: 'ta'
    },
    {
        studentId: 'GOOGLE001',
        name: 'Test Google User',
        email: 'tamiledu.student@gmail.com',
        password: 'password123',
        phone: '9876543299',
        semester: 1,
        batch: '2024-2028',
        college: 'Anna University',
        department: 'Information Technology',
        preferredLanguage: 'en'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamiledu-ai');

        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Syllabus.deleteMany({});
        await Student.deleteMany({});

        // Insert syllabus data
        console.log('📚 Seeding syllabus data...');
        await Syllabus.insertMany(syllabusData);
        console.log(`✅ Inserted ${syllabusData.length} subjects`);

        // Insert student data
        console.log('👨‍🎓 Seeding student data...');
        await Student.create(studentData);
        console.log(`✅ Inserted ${studentData.length} students`);

        console.log('');
        console.log('🎉 Database seeded successfully!');
        console.log('');
        console.log('Test Login Credentials:');
        console.log('------------------------');
        console.log('Email: rajesh@annauniv.edu');
        console.log('Password: password123');
        console.log('');
        console.log('Google Email Login (Predefined):');
        console.log('Email: tamiledu.student@gmail.com');
        console.log('Password: password123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();
