import React, { useEffect } from "react";
import { UserCircle2 } from "lucide-react";
import { Footer } from "../components/Footer";
import logoImg from "../assets/maharastraGov.jpeg";
import nekImg from "../assets/Nek.jpeg";
import siddharthImg from "../assets/Siddharth.jpg";
import rishabImg from "../assets/Rishab.jpeg";
import surajImg from "../assets/Suraj.jpg";
import prawinImg from "../assets/Prawin.jpg";
import vidhiImg from "../assets/Vidhi.jpeg";

interface StaticPageProps {
  onNavigate: (
    page:
      | "landing"
      | "login"
      | "register"
      | "faq"
      | "terms"
      | "privacy"
      | "manual"
      | "about"
      | "contact",
  ) => void;
}

const StaticLayout: React.FC<{
  title: string;
  children: React.ReactNode;
  onNavigate: any;
}> = ({ title, children, onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavToLanding = (e: React.MouseEvent, sectionId?: string) => {
    e.preventDefault();
    onNavigate("landing");
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div
      className="landing-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
      }}
    >
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div
            className="landing-nav-logo"
            style={{ cursor: "pointer" }}
            onClick={(e) => handleNavToLanding(e)}
          >
            <img src={logoImg} alt="GoM Seal" className="landing-nav-emblem" />
            <div className="landing-nav-brand-text">
              <span className="landing-nav-brand-title">
                GoM Procurement Portal
              </span>
              <span className="landing-nav-brand-sub">
                Government of Maharashtra
              </span>
            </div>
          </div>

          <ul className="landing-nav-links">
            <li>
              <a
                href="#home"
                className="landing-nav-link"
                onClick={(e) => handleNavToLanding(e, "home")}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#lifecycle"
                className="landing-nav-link"
                onClick={(e) => handleNavToLanding(e, "lifecycle")}
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#features"
                className="landing-nav-link"
                onClick={(e) => handleNavToLanding(e, "features")}
              >
                For Startups
              </a>
            </li>
            <li>
              <a
                href="#features"
                className="landing-nav-link"
                onClick={(e) => handleNavToLanding(e, "features")}
              >
                For Government
              </a>
            </li>
          </ul>

          <button
            className="landing-nav-auth-btn"
            onClick={() => onNavigate("login")}
          >
            <UserCircle2 size={17} />
            Login / Register
          </button>
        </div>
      </nav>

      <div
        style={{
          flex: 1,
          padding: "60px 20px",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow:
              "0 10px 25px -5px rgba(29, 67, 216, 0.1), 0 8px 10px -6px rgba(29, 67, 216, 0.05)",
            padding: "50px 60px",
            borderTop: "6px solid #1d43d8",
            borderBottom: "6px solid #d97706",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#1d43d8",
              marginBottom: "40px",
              textAlign: "center",
              borderBottom: "2px dashed #e2e8f0",
              paddingBottom: "20px",
            }}
          >
            {title}
          </h1>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {children}
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div
    style={{
      padding: "24px",
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      borderLeft: "4px solid #d97706",
      borderTop: "1px solid #e2e8f0",
      borderRight: "1px solid #e2e8f0",
      borderBottom: "1px solid #e2e8f0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    }}
  >
    <h3
      style={{
        fontSize: "1.2rem",
        color: "#1d43d8",
        marginTop: 0,
        marginBottom: "14px",
        fontWeight: 700,
        lineHeight: 1.4,
      }}
    >
      {title}
    </h3>
    <div style={{ color: "#334155", lineHeight: 1.7, fontSize: "1rem" }}>
      {children}
    </div>
  </div>
);

export const FaqPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <StaticLayout
      title="Frequently Asked Questions (FAQs)"
      onNavigate={onNavigate}
    >
      <SectionCard title="1. How is YantraX different from existing platforms like GeM or CPPP?">
        <p style={{ margin: 0 }}>
          YantraX does not replace GeM; rather, it acts as an "innovation
          bridge". While GeM focuses on procurement and CPPP on tendering,
          YantraX focuses on the stage before conventional procurement: problem
          discovery, startup matching, pilot evaluation, and preparing the
          solution for scale.
        </p>
      </SectionCard>

      <SectionCard title="2. How does the platform handle the lack of prior experience or turnover that usually disqualifies early-stage startups?">
        <p style={{ margin: 0 }}>
          Our platform replaces rigid traditional tenders with capped-value,
          low-risk sandbox pilots. By utilizing milestone-based, capped
          contracts, the platform lowers government risk and entirely removes
          prior-turnover and past-experience barriers for capable early-stage
          startups.
        </p>
      </SectionCard>

      <SectionCard title="3. How do you ensure only legitimate startups participate in government challenges?">
        <p style={{ margin: 0 }}>
          YantraX features a robust screening phase that integrates directly
          with DPIIT. The platform automatically verifies startup identity and
          checks eligibility through DPIIT before they can bid and participate.
        </p>
      </SectionCard>

      <SectionCard title="4. How does the AI Matching Engine work?">
        <p style={{ margin: 0 }}>
          The AI engine intelligently automates the discovery process for both
          sides. It automatically matches challenges posted by government
          departments to relevant startups based on their eligibility, sector,
          and specific project requirements.
        </p>
      </SectionCard>

      <SectionCard title="5. How is IP (Intellectual Property) and data ownership handled during the pilot phase?">
        <p style={{ margin: 0 }}>
          To prevent friction and legal risks regarding ambiguous ownership of
          IP and data, YantraX provides a Standard Templates Library. This
          library includes ready-made pilot-agreement, IP/data, and
          cybersecurity templates to standardize the drafting process for every
          department.
        </p>
      </SectionCard>
    </StaticLayout>
  );
};

export const TermsPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <StaticLayout title="Terms & Conditions" onNavigate={onNavigate}>
      <SectionCard title="1. Eligibility and Access">
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>Startup Verification:</strong> To
          bid and participate on the platform, startups must undergo identity
          verification and eligibility checks via DPIIT integration.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>User Roles:</strong> The platform
          provides specific access portals tailored for Government Departments,
          Startups, Independent Evaluators, and GeM integration.
        </p>
      </SectionCard>

      <SectionCard title="2. Pilot Projects and Execution">
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>
            Capped-Value Sandbox Orders:
          </strong>{" "}
          Approved startups will enter a pilot phase executed as capped-value
          sandbox orders to validate solutions prior to large-scale deployment.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>
            Milestone-Based Payments:
          </strong>{" "}
          Contracts are structured with milestone-based payment terms to ensure
          accountability and lower financial risk.
        </p>
      </SectionCard>

      <SectionCard title="3. Evaluation and Scaling">
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>Independent Validation:</strong>{" "}
          During the pilot, independent evaluators will validate KPIs and
          confirm readiness for scale-up.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>Scale-Up Execution:</strong>{" "}
          Successful, validated solutions will be approved for multi-department
          rollout and scaled via the GeM portal.
        </p>
      </SectionCard>

      <SectionCard title="4. Compliance and Legal">
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>Standard Agreements:</strong> All
          participants must utilize the platform's Standard Templates Library
          for problem statements, evaluation criteria, and pilot agreements to
          ensure regulatory feasibility and compliance.
        </p>
      </SectionCard>
    </StaticLayout>
  );
};

export const PrivacyPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <StaticLayout title="Privacy Policy" onNavigate={onNavigate}>
      <SectionCard title="1. Data Collection and Storage">
        <p style={{ margin: 0 }}>
          The platform collects and stores user data, application data,
          transaction data, contracts, and reports within our Data &
          Documentation Layer. Data is managed using highly available and
          scalable database systems, specifically PostgreSQL, MongoDB, and
          Redis.
        </p>
      </SectionCard>

      <SectionCard title="2. Data Security and Encryption">
        <p style={{ margin: 0 }}>
          We are committed to protecting sensitive business and government data.
          The platform implements secure authentication, data encryption, and
          strictly controlled access mechanisms across all portals.
        </p>
      </SectionCard>

      <SectionCard title="3. Data Sharing and Integrations">
        <p style={{ margin: 0 }}>
          To facilitate the end-to-end digital workflow, necessary data is
          securely integrated and shared with trusted third parties, including
          DPIIT (for identity checks) and the GeM Portal (for executing winning
          orders).
        </p>
      </SectionCard>

      <SectionCard title="4. System Monitoring">
        <p style={{ margin: 0 }}>
          The platform utilizes live, interactive dashboards for the real-time
          monitoring of key performance indicators (KPIs), milestones, system
          activity, and procurement insights.
        </p>
      </SectionCard>
    </StaticLayout>
  );
};

export const UserManualPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <StaticLayout title="User Manual" onNavigate={onNavigate}>
      <SectionCard title="Introduction to ProcureBridge">
        <p style={{ margin: 0 }}>
          Welcome to ProcureBridge, an end-to-end digital platform designed to
          enable government departments to identify, pilot, procure, and scale
          innovative solutions from eligible startups. This manual outlines the
          specific workflows for our primary platform users.
        </p>
      </SectionCard>

      <SectionCard title="Government Department Guide">
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>
            Drafting Problem Statements:
          </strong>{" "}
          Navigate to the Challenge Management module and utilize the Standard
          Templates Library to easily draft outcome-based problem statements,
          evaluation criteria, and cybersecurity agreements.
        </p>
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>Launching Pilots:</strong>{" "}
          Publish your challenge to the unified platform to initiate the
          discovery phase. Instead of issuing rigid tenders, you will issue
          low-risk, capped-value sandbox pilot orders.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>Live Monitoring:</strong> Access
          your interactive dashboard to track real-time KPIs, project
          milestones, and authorize milestone-based payment terms as the pilot
          progresses.
        </p>
      </SectionCard>

      <SectionCard title="Startup Innovator Guide">
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>
            Onboarding & Verification:
          </strong>{" "}
          Register through the Startup Portal. The platform automatically
          interfaces with DPIIT to verify your startup identity and check
          eligibility, entirely removing traditional prior-turnover barriers.
        </p>
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>Automated Discovery:</strong> You
          do not need to manually search for tenders. The AI Matching Engine
          intelligently connects your profile with relevant government
          challenges based on sector and eligibility.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>Delivering Solutions:</strong>{" "}
          Once selected, bid and participate in the pilot phase. Execute your
          innovative solutions under protected IP agreements while receiving
          structured, milestone-based payments.
        </p>
      </SectionCard>

      <SectionCard title="Evaluator & Scale-Up Workflow">
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>Independent Evaluation:</strong>{" "}
          Independent evaluators log into a dedicated Evaluator Portal to review
          the active pilots.
        </p>
        <p style={{ margin: "0 0 10px 0" }}>
          <strong style={{ color: "#0f172a" }}>KPI Validation:</strong>{" "}
          Evaluators conduct transparent evaluation and scoring based on the
          predefined KPIs to confirm if the solution is ready for scale-up.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#0f172a" }}>GeM Integration:</strong> Once
          validated by evaluators and approved by the department, the solution
          transitions to the GeM Portal for multi-department rollout and
          large-scale execution.
        </p>
      </SectionCard>
    </StaticLayout>
  );
};

export const AboutUsPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  const teamMembers = [
    {
      name: "Siddharth Pandey",
      role: "Frontend & backend",
      color: "#713bf0",
      img: siddharthImg,
      imgScale: "scale(1.25) translateY(-20%)",
      imgPos: "center top",
    },
    {
      name: "Rishab jat",
      role: "Team leader",
      color: "#10b981",
      img: rishabImg,
      imgPos: "center 25%",
    },
    {
      name: "Neknarayan",
      role: "Backend Developer & Visual artist",
      color: "#3b82f6",
      img: nekImg,
    },
    {
      name: "Suraj Chaurasiya",
      role: "frontend",
      color: "#e92929",
      img: surajImg,
    },
    {
      name: "Prawin Kumar",
      role: "Ai/Ml & model traning",
      color: "#06b6d4",
      img: prawinImg,
    },
    {
      name: "Vidhi Jain",
      role: "Ml & Corporate Responsibility",
      color: "#c61ae0",
      img: vidhiImg,
    },
  ];

  return (
    <StaticLayout title="About Us" onNavigate={onNavigate}>
      <SectionCard title="Team Members">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}
        >
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                boxShadow: `0 10px 25px -5px ${member.color}40, 0 8px 10px -6px ${member.color}40`,
                border: `1px solid ${member.color}30`,
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = `0 20px 25px -5px ${member.color}60, 0 10px 10px -5px ${member.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${member.color}40, 0 8px 10px -6px ${member.color}40`;
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  margin: "0 auto 1.25rem auto",
                  borderRadius: "50%",
                  padding: "4px",
                  background: `linear-gradient(135deg, ${member.color}, ${member.color}80)`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: member.imgPos || "top",
                      transform: member.imgScale || "scale(1)",
                    }}
                  />
                </div>
              </div>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.35rem",
                  color: member.color,
                  fontWeight: "800",
                }}
              >
                {member.name}
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "1rem",
                  fontWeight: "700",
                }}
              >
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Who We Are">
        <p style={{ margin: 0 }}>
          We are Team YantraX, the creators of ProcureBridge—an innovative
          platform developed for the Smart India Hackathon 2026 (Problem
          Statement ID: SIH26136). We are driven by the vision of bridging the
          gap between cutting-edge startup innovation and government public
          procurement.
        </p>
      </SectionCard>

      <SectionCard title="Our Mission">
        <p style={{ margin: 0 }}>
          Our mission is to build a transparent, efficient, and scalable
          procurement ecosystem for government innovation. We aim to replace
          rigid, spec-based traditional tenders with an agile, outcome-based
          mechanism that enables government departments to seamlessly identify,
          pilot, procure, and scale innovative solutions from eligible startups.
        </p>
      </SectionCard>

      <SectionCard title="The Problem We Are Solving">
        <p style={{ margin: 0 }}>
          Historically, public procurement has been a manual and slow process
          burdened by fragmented information and long sales cycles. Furthermore,
          standard tenders often include strict prior-turnover and
          past-experience clauses that unintentionally shut out capable,
          early-stage startups. This results in limited startup participation
          and innovative solutions being overlooked.
        </p>
      </SectionCard>

      <SectionCard title="Our Solution: ProcureBridge">
        <p style={{ margin: "0 0 10px 0" }}>
          To solve this, we built ProcureBridge, a unified digital platform that
          connects government departments, startups, DPIIT, independent
          evaluators, and GeM into a single end-to-end workflow.
        </p>
        <p style={{ margin: "0 0 10px 0" }}>
          Our platform stands out by offering:
        </p>
        <ul style={{ margin: "0 0 0 20px", padding: 0 }}>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#0f172a" }}>AI-Powered Discovery:</strong>{" "}
            Intelligently matching government challenges with relevant, eligible
            startups.
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#0f172a" }}>Pilot-First Approach:</strong>{" "}
            Utilizing capped-value, milestone-based sandbox pilots to validate
            solutions and lower financial risks before large-scale deployment.
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#0f172a" }}>Barrier-Free Entry:</strong>{" "}
            Integrating directly with DPIIT to screen eligibility automatically,
            removing traditional turnover hurdles for startups.
          </li>
          <li style={{ marginBottom: "0" }}>
            <strong style={{ color: "#0f172a" }}>Standardized Security:</strong>{" "}
            Providing ready-made templates for IP, data disputes, and
            cybersecurity to ensure safe and frictionless collaborations.
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Our Impact">
        <p style={{ margin: 0 }}>
          Through ProcureBridge, we are striving for a future where public funds
          are used smarter, local empowerment and job creation are accelerated,
          and citizens benefit from better, more innovative public services.
        </p>
      </SectionCard>
    </StaticLayout>
  );
};

export const ContactUsPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <StaticLayout title="Contact Us" onNavigate={onNavigate}>
      <SectionCard title="Email Us Directly">
        <p style={{ margin: "0 0 10px 0" }}>
          Drop us a message and we will get back to you as soon as possible.
        </p>
        <p style={{ margin: "0 0 20px 0" }}>
          <a
            href="mailto:sidmusicpandey@gmail.com"
            style={{
              color: "#2563eb",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            sidmusicpandey@gmail.com
          </a>
        </p>
        <p style={{ margin: "0 0 10px 0", fontWeight: 600, color: "#0f172a" }}>
          What to include in your email:
        </p>
        <ul style={{ margin: "0 0 0 20px", padding: 0 }}>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#0f172a" }}>Subject Line:</strong> Please
            mention the reason for your contact (e.g., Question about
            ProcureBridge Pilot, SIH Feedback, or General Inquiry).
          </li>
          <li style={{ marginBottom: "0" }}>
            <strong style={{ color: "#0f172a" }}>Your Details:</strong> Include
            your name, organization (if applicable), and how we can best assist
            you.
          </li>
        </ul>
      </SectionCard>
    </StaticLayout>
  );
};
