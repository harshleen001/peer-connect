import React, { useState } from "react";

export default function StudentRegistrationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    
    // Educational Background
    currentEducation: "",
    institution: "",
    fieldOfStudy: "",
    yearOfStudy: "",
    
    // Interests & Goals
    areasOfInterest: [],
    careerGoals: "",
    learningObjectives: "",
    
    // Skills & Experience
    currentSkills: [],
    experience: "",
    projects: "",
    
    // Preferences
    preferredMentorshipStyle: "",
    availability: [],
    timeZone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areasOfInterestOptions = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "AI",
    "Backend Development",
    "Frontend Development",
    "DevOps",
    "Cybersecurity",
    "Cloud Computing",
    "UI/UX Design",
    "Product Management",
    "Business Strategy",
  ];

  const skillOptions = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "SQL",
    "Git",
    "HTML/CSS",
    "TypeScript",
    "MongoDB",
    "AWS",
    "Docker",
  ];

  const availabilityOptions = [
    "Weekday Mornings",
    "Weekday Afternoons",
    "Weekday Evenings",
    "Weekend Mornings",
    "Weekend Afternoons",
    "Weekend Evenings",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
    }

    if (currentStep === 2) {
      if (!formData.currentEducation) newErrors.currentEducation = "Education level is required";
      if (!formData.institution.trim()) newErrors.institution = "Institution name is required";
      if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = "Field of study is required";
    }

    if (currentStep === 3) {
      if (formData.areasOfInterest.length === 0) {
        newErrors.areasOfInterest = "Select at least one area of interest";
      }
      if (!formData.careerGoals.trim()) newErrors.careerGoals = "Career goals are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Student Registration Data:", formData);
      alert("🎉 Registration successful! Welcome to the Mentorship Platform!");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("userName", formData.fullName);
      window.location.href = "/";
    }, 1500);
  };

  const ProgressBar = () => (
    <div style={{ marginBottom: "32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        {[1, 2, 3, 4].map((stepNum) => (
          <div
            key={stepNum}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "14px",
              color: step >= stepNum ? "#667eea" : "#94a3b8",
              fontWeight: step === stepNum ? "600" : "400",
            }}
          >
            Step {stepNum}
          </div>
        ))}
      </div>
      <div
        style={{
          height: "6px",
          background: "#e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / 4) * 100}%`,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );

  const InputField = ({ label, name, type = "text", required = false, ...props }) => (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#1e293b",
          fontWeight: "500",
          fontSize: "14px",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: errors[name] ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          transition: "all 0.2s ease",
        }}
        {...props}
      />
      {errors[name] && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  const TextArea = ({ label, name, required = false, ...props }) => (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#1e293b",
          fontWeight: "500",
          fontSize: "14px",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: errors[name] ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          minHeight: "100px",
          resize: "vertical",
          fontFamily: "inherit",
        }}
        {...props}
      />
      {errors[name] && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  const SelectField = ({ label, name, options, required = false }) => (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#1e293b",
          fontWeight: "500",
          fontSize: "14px",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: errors[name] ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          cursor: "pointer",
          backgroundColor: "white",
        }}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  const MultiSelectChips = ({ label, options, field, required = false }) => (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#1e293b",
          fontWeight: "500",
          fontSize: "14px",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          padding: "12px",
          border: errors[field] ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px",
          minHeight: "50px",
        }}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleMultiSelect(field, option)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              background: formData[field].includes(option)
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#f1f5f9",
              color: formData[field].includes(option) ? "white" : "#475569",
            }}
          >
            {option}
            {formData[field].includes(option) && " ✓"}
          </button>
        ))}
      </div>
      {errors[field] && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "36px",
            }}
          >
            🎓
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1e293b",
              marginBottom: "8px",
            }}
          >
            Student Registration
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            Join our mentorship community and accelerate your learning journey
          </p>
        </div>

        <ProgressBar />

        <div>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "24px",
                }}
              >
                Personal Information
              </h2>

              <InputField
                label="Full Name"
                name="fullName"
                required
                placeholder="Enter your full name"
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                required
                placeholder="your.email@example.com"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                />

                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter password"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 1234567890"
                />

                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  required
                />
              </div>

              <SelectField
                label="Gender"
                name="gender"
                options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                required
              />
            </div>
          )}

          {/* Step 2: Educational Background */}
          {step === 2 && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "24px",
                }}
              >
                Educational Background
              </h2>

              <SelectField
                label="Current Education Level"
                name="currentEducation"
                options={[
                  "High School",
                  "Undergraduate",
                  "Graduate",
                  "Postgraduate",
                  "Self-taught / Bootcamp",
                  "Professional",
                ]}
                required
              />

              <InputField
                label="Institution Name"
                name="institution"
                required
                placeholder="Your school, college, or university"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InputField
                  label="Field of Study"
                  name="fieldOfStudy"
                  required
                  placeholder="e.g., Computer Science"
                />

                <SelectField
                  label="Year of Study"
                  name="yearOfStudy"
                  options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Graduated"]}
                />
              </div>
            </div>
          )}

          {/* Step 3: Interests & Goals */}
          {step === 3 && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "24px",
                }}
              >
                Interests & Goals
              </h2>

              <MultiSelectChips
                label="Areas of Interest"
                options={areasOfInterestOptions}
                field="areasOfInterest"
                required
              />

              <TextArea
                label="Career Goals"
                name="careerGoals"
                required
                placeholder="What are your career aspirations? What do you want to achieve?"
              />

              <TextArea
                label="Learning Objectives"
                name="learningObjectives"
                placeholder="What specific skills or knowledge do you want to gain?"
              />
            </div>
          )}

          {/* Step 4: Skills & Preferences */}
          {step === 4 && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: "24px",
                }}
              >
                Skills & Preferences
              </h2>

              <MultiSelectChips
                label="Current Skills"
                options={skillOptions}
                field="currentSkills"
              />

              <SelectField
                label="Experience Level"
                name="experience"
                options={["Beginner", "Intermediate", "Advanced"]}
              />

              <TextArea
                label="Projects or Achievements"
                name="projects"
                placeholder="Describe any projects, achievements, or relevant experience"
              />

              <SelectField
                label="Preferred Mentorship Style"
                name="preferredMentorshipStyle"
                options={[
                  "Regular 1-on-1 Sessions",
                  "Group Mentoring",
                  "Flexible / Ad-hoc",
                  "Project-based",
                ]}
              />

              <MultiSelectChips
                label="Availability"
                options={availabilityOptions}
                field="availability"
              />

              <SelectField
                label="Time Zone"
                name="timeZone"
                options={[
                  "IST (UTC+5:30)",
                  "EST (UTC-5)",
                  "PST (UTC-8)",
                  "GMT (UTC+0)",
                  "CET (UTC+1)",
                ]}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "white",
                  color: "#475569",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ← Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "none",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "none",
                  borderRadius: "10px",
                  background: isSubmitting
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {isSubmitting ? "Submitting..." : "Complete Registration 🎉"}
              </button>
            )}
          </div>

          {/* Login Link */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => window.location.href = "/login"}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}