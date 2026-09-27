export const schemes = [
  {
    id: 'nfst',
    name: 'National Fellowship for ST Students (NFST)',
    shortName: 'NFST',
    version: 'v2',
    status: 'Published',
    description: 'Fellowship for higher education (M.Phil and Ph.D) for ST students.',
    educationLevel: 'Postgraduate / Ph.D',
    closingDate: '2026-10-31',
    lastUpdated: '2026-09-01',
    applicationsCount: 4820,
    config: {
      sections: [
        {
          title: "Personal Details",
          fields: [
            { id: "fullName", type: "text", label: "Full Name", labelHi: "पूरा नाम", required: true },
            { id: "dob", type: "date", label: "Date of Birth", labelHi: "जन्म तिथि", required: true },
            { id: "gender", type: "select", label: "Gender", labelHi: "लिंग", required: true, options: ["Male", "Female", "Transgender", "Other"] },
            { id: "category", type: "select", label: "Category", labelHi: "श्रेणी", required: true, options: ["ST"] },
            { id: "familyIncome", type: "number", label: "Annual Family Income", labelHi: "वार्षिक पारिवारिक आय", required: true }
          ]
        },
        {
          title: "Academic Details",
          fields: [
            { id: "pgDegree", type: "text", label: "Post Graduation Degree", labelHi: "स्नातकोत्तर डिग्री", required: true },
            { id: "university", type: "text", label: "University Name", labelHi: "विश्वविद्यालय का नाम", required: true },
            { id: "pgPercentage", type: "number", label: "PG Percentage (%)", labelHi: "स्नातकोत्तर प्रतिशत", required: true }
          ]
        }
      ],
      documents: [
        { id: "doc_photo", name: "Passport Size Photograph", required: true, maxSize: 1024 * 500, format: "image/jpeg" },
        { id: "doc_st", name: "ST Certificate", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" },
        { id: "doc_income", name: "Income Certificate", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" },
        { id: "doc_marksheet", name: "PG Marksheet", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" },
        { id: "doc_admission", name: "Admission / Institute Letter", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" }
      ],
      rules: [
        { id: "rule_income", type: "LESS_THAN_EQUAL", field: "familyIncome", value: 600000, description: "Family Income ≤ ₹6,00,000", source: "Clause 4.1" },
        { id: "rule_category", type: "EQUALS", field: "category", value: "ST", description: "Category must be Scheduled Tribe", source: "Clause 3.1" },
        { id: "rule_pg", type: "GREATER_THAN_EQUAL", field: "pgPercentage", value: 55, description: "PG Marks ≥ 55%", source: "Clause 4.3" }
      ]
    }
  },
  {
    id: 'nos',
    name: 'National Overseas Scholarship (NOS)',
    shortName: 'NOS',
    version: 'v3',
    status: 'Published',
    description: 'Financial assistance to ST students pursuing Master level courses and Ph.D abroad.',
    educationLevel: 'Masters / Ph.D Abroad',
    closingDate: '2026-11-15',
    lastUpdated: '2026-08-15',
    applicationsCount: 1240,
    config: {
      sections: [
        {
          title: "Personal Details",
          fields: [
            { id: "fullName", type: "text", label: "Full Name", labelHi: "पूरा नाम", required: true },
            { id: "dob", type: "date", label: "Date of Birth", labelHi: "जन्म तिथि", required: true },
            { id: "passportNo", type: "text", label: "Passport Number", labelHi: "पासपोर्ट संख्या", required: true },
            { id: "familyIncome", type: "number", label: "Annual Family Income", labelHi: "वार्षिक पारिवारिक आय", required: true }
          ]
        },
        {
          title: "Foreign Admission Details",
          fields: [
            { id: "foreignUniversity", type: "text", label: "Name of Foreign University", labelHi: "विदेशी विश्वविद्यालय का नाम", required: true },
            { id: "country", type: "select", label: "Country", labelHi: "देश", required: true, options: ["USA", "UK", "Canada", "Australia", "Other"] },
            { id: "courseName", type: "text", label: "Course Name", labelHi: "कोर्स का नाम", required: true }
          ]
        }
      ],
      documents: [
        { id: "doc_passport", name: "Copy of Passport", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" },
        { id: "doc_st", name: "ST Certificate", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" },
        { id: "doc_income", name: "Income Certificate", required: true, maxSize: 1024 * 1024 * 2, format: "application/pdf" },
        { id: "doc_offer", name: "Offer Letter from Foreign University", required: true, maxSize: 1024 * 1024 * 5, format: "application/pdf" }
      ],
      rules: [
        { id: "rule_income", type: "LESS_THAN_EQUAL", field: "familyIncome", value: 600000, description: "Family Income ≤ ₹6,00,000", source: "Clause 4.1" },
        { id: "rule_category", type: "EQUALS", field: "category", value: "ST", description: "Category must be Scheduled Tribe", source: "Clause 3.1" },
      ]
    }
  },
  {
    id: 'tce',
    name: 'Top Class Education Scheme',
    shortName: 'TCE', version: 'demo', status: 'Published',
    description: 'Support for ST students pursuing study at eligible institutions. Check current official guidelines for the complete criteria.',
    educationLevel: 'Undergraduate / Postgraduate',
    closingDate: null,
    lastUpdated: '2026-09-01', applicationsCount: 0,
    config: {
      sections: [
        { title: 'Personal Details', fields: [
          { id: 'fullName', type: 'text', label: 'Full Name', labelHi: 'पूरा नाम', required: true },
          { id: 'dob', type: 'date', label: 'Date of Birth', labelHi: 'जन्म तिथि', required: true },
          { id: 'category', type: 'select', label: 'Category', labelHi: 'श्रेणी', required: true, options: ['ST'] },
        ] },
        { title: 'Academic Details', fields: [
          { id: 'courseName', type: 'text', label: 'Course Name', labelHi: 'कोर्स का नाम', required: true },
          { id: 'university', type: 'text', label: 'Institute Name', labelHi: 'संस्थान का नाम', required: true },
          { id: 'yearOfStudy', type: 'number', label: 'Year of Study', labelHi: 'अध्ययन वर्ष', required: true },
        ] },
      ],
      documents: [
        { id: 'doc_st', name: 'ST Certificate', required: true, maxSize: 2 * 1024 * 1024, format: 'application/pdf' },
        { id: 'doc_admission', name: 'Admission / Institute Letter', required: true, maxSize: 2 * 1024 * 1024, format: 'application/pdf' },
      ],
      rules: [{ id: 'rule_category', type: 'EQUALS', field: 'category', value: 'ST', description: 'Category must be Scheduled Tribe', source: 'Demo rule' }],
    },
  }
];

export const mockApplications = [
  {
    id: "NFST-26-04812",
    applicantName: "Ananya Sharma",
    schemeId: "nfst",
    schemeName: "National Fellowship for ST Students",
    submittedDate: "2026-09-24T09:31:00Z",
    status: "Under Scrutiny",
    aiFlags: 1,
    slaMs: 1000 * 60 * 60 * 2 + 1000 * 60 * 14, // 2h 14m
    assignee: "Drishti",
    progress: [
      { stage: "Applied", completed: true, timestamp: "2026-09-24T09:31:00Z" },
      { stage: "Documents Submitted", completed: true, timestamp: "2026-09-24T09:31:30Z" },
      { stage: "AI Pre-check", completed: true, timestamp: "2026-09-24T09:33:00Z" },
      { stage: "Deficiency", completed: false, active: false },
      { stage: "Scrutiny", completed: false, active: true, timestamp: "2026-09-24T10:12:00Z" },
      { stage: "Selection", completed: false, active: false }
    ],
    timeline: [
      { time: "09:31", actor: "Applicant", role: "applicant", action: "Application Submitted", details: "Application created and submitted." },
      { time: "09:33", actor: "AI-assisted Service", role: "system", action: "Document Pre-check Completed", details: "1 field flagged for review." },
      { time: "10:12", actor: "Officer", role: "officer", action: "Review Started", details: "Application assigned to Drishti." }
    ],
    formData: {
      fullName: "Ananya Sharma",
      dob: "2002-05-14",
      gender: "Female",
      category: "ST",
      familyIncome: 420000,
      pgDegree: "M.Sc Physics",
      university: "Delhi University",
      pgPercentage: 78
    },
    documents: [
      { id: "doc_photo", name: "Passport Size Photograph", status: "Ready", aiCheck: "Clear" },
      { id: "doc_st", name: "ST Certificate", status: "Ready", aiCheck: "Clear", extracted: { category: "ST", confidence: 98 } },
      { id: "doc_income", name: "Income Certificate", status: "Flagged", aiCheck: "Issue Found", 
        issue: "The issue date is difficult to read. Please upload a clearer copy.",
        extracted: { 
          familyIncome: { value: 420000, confidence: 96 },
          issuingAuthority: { value: "Tehsildar", confidence: 93 },
          issueDate: { value: "Unreadable", confidence: 41 }
        }
      },
      { id: "doc_marksheet", name: "PG Marksheet", status: "Ready", aiCheck: "Clear" },
      { id: "doc_admission", name: "Admission / Institute Letter", status: "Ready", aiCheck: "Clear" }
    ],
    rulesEvaluation: [
      { ruleId: "rule_income", passed: true, actual: "₹4,20,000" },
      { ruleId: "rule_category", passed: true, actual: "ST" },
      { ruleId: "rule_pg", passed: true, actual: "78%" },
    ]
  },
  {
    id: "NFST-26-04813",
    applicantName: "Rahul Kumar",
    schemeId: "nfst",
    schemeName: "National Fellowship for ST Students",
    submittedDate: "2026-09-23T14:15:00Z",
    status: "Deficiency",
    aiFlags: 0,
    slaMs: 0,
    assignee: "Sanjay",
    progress: [
      { stage: "Applied", completed: true },
      { stage: "Documents Submitted", completed: true },
      { stage: "AI Pre-check", completed: true },
      { stage: "Deficiency", completed: false, active: true },
      { stage: "Scrutiny", completed: false, active: false },
      { stage: "Selection", completed: false, active: false }
    ],
    timeline: [
      { time: "Sep 23, 14:15", actor: "Applicant", role: "applicant", action: "Application Submitted" },
      { time: "Sep 24, 10:20", actor: "Officer", role: "officer", action: "Query Raised", details: "Income certificate issue date unreadable." }
    ],
    formData: {
      fullName: "Rahul Kumar",
      familyIncome: 550000
    },
    documents: [
      { id: "doc_income", name: "Income Certificate", status: "Flagged", deficiency: "Issue date is not readable.", officerRemark: "Please upload a clearer income certificate showing issuing authority and issue date.", dueDate: "2026-09-28" }
    ],
    rulesEvaluation: []
  },
  {
    id: "NFST-26-04800",
    applicantName: "Priya Meena",
    schemeId: "nfst",
    schemeName: "National Fellowship for ST Students",
    submittedDate: "2026-09-20T10:00:00Z",
    status: "Shortlisted",
    aiFlags: 0,
    slaMs: 0,
    assignee: "Committee",
    progress: [
      { stage: "Applied", completed: true },
      { stage: "Documents Submitted", completed: true },
      { stage: "AI Pre-check", completed: true },
      { stage: "Deficiency", completed: true, active: false },
      { stage: "Scrutiny", completed: true, active: false },
      { stage: "Eligible", completed: true, active: false },
      { stage: "Shortlisted", completed: false, active: true },
      { stage: "Selection", completed: false, active: false }
    ],
    committeeScores: {
      academicScore: 45,
      researchExperience: 20,
      interview: 24,
      preference: 3,
      total: 92
    },
    timeline: [],
    formData: { fullName: "Priya Meena" }, documents: [], rulesEvaluation: []
  }
];

export const userContext = {
  roles: [
    { id: 'applicant', name: 'Applicant' },
    { id: 'admin', name: 'Scheme Administrator' },
    { id: 'officer', name: 'Scrutiny Officer' },
    { id: 'committee', name: 'Committee Member' },
    { id: 'ministry', name: 'Ministry Viewer' }
  ]
};
