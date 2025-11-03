import React, { useState, useRef, useEffect } from "react";
import {api} from "./api"; // ✅ Import api.js wrapper


// Input with forwardRef for focus
const InputField = React.forwardRef(
  ({ label, name, type = "text", required = false, value, onChange, error, ...props }, ref) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", marginBottom: "8px", color: "#1e293b", fontWeight: "500", fontSize: "14px" }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: error ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          transition: "all 0.2s ease",
        }}
        {...props}
      />
      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  )
);

function StudentRegistrationPage() {
  // Add role to state
  const [role, setRole] = useState("");
  const [step, setStep] = useState(0); // 0 is role select, 1+ are form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    currentEducation: "",
    institution: "",
    fieldOfStudy: "",
    yearOfStudy: "",
    areasOfInterest: [],
    careerGoals: "",
    learningObjectives: "",
    currentSkills: [],
    experience: "",
    projects: "",
    preferredMentorshipStyle: "",
    availability: [],
    timeZone: "",
    mentorAbout: "", // Extra field for mentor-only
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areasOfInterestOptions = [
    "Web Development", "Mobile Development", "Data Science", "Machine Learning", "AI",
    "Backend Development", "Frontend Development", "DevOps", "Cybersecurity", "Cloud Computing",
    "UI/UX Design", "Product Management", "Business Strategy",
  ];
  const skillOptions = [
    "JavaScript", "Python", "Java", "React", "Node.js", "SQL", "Git",
    "HTML/CSS", "TypeScript", "MongoDB", "AWS", "Docker",
  ];
  const availabilityOptions = [
    "Weekday Mornings", "Weekday Afternoons", "Weekday Evenings",
    "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings",
  ];
  const mentorshipStyles = [
    "Regular 1-on-1 Sessions", "Group Mentoring", "Flexible / Ad-hoc", "Project-based",
  ];
  const timeZones = [
    "IST (UTC+5:30)", "EST (UTC-5)", "PST (UTC-8)", "GMT (UTC+0)", "CET (UTC+1)",
  ];

  const nameInputRef = useRef(null);
  useEffect(() => {
    if (step === 1 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Add role select validation
  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!role) newErrors.role = "Please select Mentor or Mentee";
    }
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
      if (role === "mentor" && !formData.mentorAbout.trim()) {
        newErrors.mentorAbout = "Please describe your mentoring background";
      }
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

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep(4)) return;
  setIsSubmitting(true);

  const registrationData = {
    name: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: role,
    year: formData.yearOfStudy || "Other",
    branch: formData.fieldOfStudy,
    phone: formData.phone,
    bio: formData.careerGoals,
    skills: formData.currentSkills,
    interests: formData.areasOfInterest,
    achievements: formData.projects,
    address: formData.address || "",
    resumeLink: formData.resumeLink || "",
    profilePicture: formData.profilePicture || "",
  };

  try {
    // ✅ Use your api.js wrapper instead of raw fetch
    const data = await api("/auth/register", "POST", registrationData);

    alert("🎉 Registration successful!");
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/";
  } catch (error) {
    console.error("Registration error:", error);
    alert(error.message || "Registration failed.");
  } finally {
    setIsSubmitting(false);
  }
};


  // UI helpers (TextArea, MultiSelectChips, SelectField, ProgressBar)
  const TextArea = ({ label, name, required = false, ...props }) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", marginBottom: "8px", color: "#1e293b", fontWeight: "500", fontSize: "14px"
      }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={{
          width: "100%", padding: "12px 16px",
          border: errors[name] ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px", fontSize: "14px", outline: "none",
          minHeight: "100px", resize: "vertical", fontFamily: "inherit",
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
      <label style={{
        display: "block", marginBottom: "8px", color: "#1e293b", fontWeight: "500", fontSize: "14px"
      }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={{
          width: "100%", padding: "12px 16px",
          border: errors[name] ? "2px solid #ef4444" : "1px solid #e2e8f0",
          borderRadius: "8px", fontSize: "14px", outline: "none",
          cursor: "pointer", backgroundColor: "white",
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
      <label style={{
        display: "block", marginBottom: "8px", color: "#1e293b", fontWeight: "500", fontSize: "14px"
      }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px",
        border: errors[field] ? "2px solid #ef4444" : "1px solid #e2e8f0",
        borderRadius: "8px", minHeight: "50px",
      }}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleMultiSelect(field, option)}
            style={{
              padding: "8px 16px", borderRadius: "20px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: "500",
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

  const ProgressBar = () => (
    <div style={{ marginBottom: "32px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: "12px",
      }}>
        {[0, 1, 2, 3, 4].map((stepNum) => (
          <div
            key={stepNum}
            style={{
              flex: 1, textAlign: "center", fontSize: "14px",
              color: step >= stepNum ? "#667eea" : "#94a3b8",
              fontWeight: step === stepNum ? "600" : "400",
            }}
          >
            {stepNum === 0 ? "Role" : `Step ${stepNum}`}
          </div>
        ))}
      </div>
      <div style={{
        height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${(step / 4) * 100}%`,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "700px", margin: "0 auto", background: "white", borderRadius: "20px",
        padding: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "80px", height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "36px",
          }}>
            {role === "mentor" ? "🧑‍🏫" : role === "mentee" ? "🎓" : "📝"}
          </div>
          <h1 style={{
            fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px",
          }}>
            {role ? (role === "mentor" ? "Mentor Registration" : "Mentee Registration") : "Choose Registration Type"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            {role
              ? `Join as a ${role === "mentor" ? "mentor" : "mentee"} and help grow our mentorship community!`
              : "Please select if you want to register as a Mentor or Mentee."}
          </p>
        </div>

        <ProgressBar />

        <div>
          {/* Step 0: Role selection */}
          {step === 0 && (
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <button
                type="button"
                onClick={() => setRole("mentee")}
                style={{
                  padding: "15px 36px", margin: "0 12px",
                  border: role === "mentee" ? "3px solid #667eea" : "1px solid #e2e8f0",
                  background: role === "mentee"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "white",
                  color: role === "mentee" ? "white" : "#475569",
                  borderRadius: "10px",
                  fontWeight: "600", fontSize: "18px", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Register as Mentee
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                style={{
                  padding: "15px 36px", margin: "0 12px",
                  border: role === "mentor" ? "3px solid #667eea" : "1px solid #e2e8f0",
                  background: role === "mentor"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "white",
                  color: role === "mentor" ? "white" : "#475569",
                  borderRadius: "10px",
                  fontWeight: "600", fontSize: "18px", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Register as Mentor
              </button>
              {errors.role && (
                <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "18px" }}>{errors.role}</p>
              )}
              <div style={{marginTop: "32px"}}>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    padding: "14px 48px", border: "none", borderRadius: "10px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer"
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "24px"
              }}>
                Personal Information
              </h2>
              <InputField
                label="Full Name"
                name="fullName"
                required
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                ref={nameInputRef}
                autoFocus
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                required
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
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
              <h2 style={{
                fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "24px"
              }}>
                Educational Background
              </h2>
              <SelectField
                label="Current Education Level"
                name="currentEducation"
                options={[
                  "High School", "Undergraduate", "Graduate",
                  "Postgraduate", "Self-taught / Bootcamp", "Professional",
                ]}
                required
              />
              <InputField
                label="Institution Name"
                name="institution"
                required
                placeholder="Your school, college, or university"
                value={formData.institution}
                onChange={handleChange}
                error={errors.institution}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InputField
                  label="Field of Study"
                  name="fieldOfStudy"
                  required
                  placeholder="e.g., Computer Science"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  error={errors.fieldOfStudy}
                />
                <SelectField
                  label="Year of Study"
                  name="yearOfStudy"
                  options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Graduated"]}
                />
              </div>
            </div>
          )}

          {/* Step 3: Interests, Goals, Mentor About */}
          {step === 3 && (
            <div>
              <h2 style={{
                fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "24px"
              }}>
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
              {/* Mentor-only field */}
              {role === "mentor" && (
                <TextArea
                  label="About Your Mentoring Experience"
                  name="mentorAbout"
                  required
                  placeholder="Describe your mentoring experience, subjects you can guide, and qualifications."
                />
              )}
            </div>
          )}

          {/* Step 4: Skills & Preferences */}
          {step === 4 && (
            <div>
              <h2 style={{
                fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "24px"
              }}>
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
                options={mentorshipStyles}
              />
              <MultiSelectChips
                label="Availability"
                options={availabilityOptions}
                field="availability"
              />
              <SelectField
                label="Time Zone"
                name="timeZone"
                options={timeZones}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: "flex", gap: "12px", marginTop: "32px", paddingTop: "24px",
            borderTop: "1px solid #e2e8f0",
          }}>
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1, padding: "14px", border: "1px solid #e2e8f0", borderRadius: "10px",
                  background: "white", color: "#475569", fontSize: "16px",
                  fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease",
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
                  flex: 1, padding: "14px", border: "none", borderRadius: "10px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white", fontSize: "16px",
                  fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease",
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
                  flex: 1, padding: "14px", border: "none", borderRadius: "10px",
                  background: isSubmitting
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white", fontSize: "16px", fontWeight: "600",
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
                  background: "none", border: "none",
                  color: "#667eea", fontWeight: "600", cursor: "pointer", textDecoration: "underline",
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

export default StudentRegistrationPage;