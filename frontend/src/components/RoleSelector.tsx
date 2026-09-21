import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Sparkles, Award, UserCheck } from "lucide-react";
import logoImg from "../assets/maharashtraGov.jpeg";
export const RoleSelector: React.FC = () => {
  const { users, currentUser, setCurrentUser } = useAuth();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(e.target.value, 10);
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "officer":
        return <Shield size={13} className="gov-icon-accent" />;
      case "startup":
        return <Sparkles size={13} className="gov-icon-accent" />;
      case "evaluator":
        return <Award size={13} className="gov-icon-accent" />;
      default:
        return <UserCheck size={13} className="gov-icon-accent" />;
    }
  };

  return (
    <header className="gov-header">
      {/* Left: Government of Maharashtra Identity & Platform Title */}
      <div className="gov-brand-container">
        {/* Government of Maharashtra Seal & Identity Area */}
        <div className="gov-state-identity">
          <div
            className="gov-emblem-wrapper"
            title="महाराष्ट्र शासन | Government of Maharashtra"
          >
            <img
              src={logoImg}
              alt="Government of Maharashtra Seal"
              className="gov-emblem-img"
            />
          </div>
          <div className="gov-state-text">
            <span className="gov-state-mr">महाराष्ट्र शासन</span>
            <span className="gov-state-en">Government of Maharashtra</span>
          </div>
        </div>

        {/* Subtle Institutional Divider */}
        <div className="gov-header-divider" aria-hidden="true" />

        {/* Platform Title & Subtitle */}
        <div className="gov-platform-identity">
          <h1 className="gov-platform-title">
            GovTech Innovation & Pilot Lifecycle Platform
          </h1>
          <p className="gov-platform-subtitle">
            Challenge-to-Pilot Workflow with Explainable Decision Support
          </p>
        </div>
      </div>

      {/* Right: Demo Persona Selector & Active User Status */}
      <div className="gov-actions-container">
        <div className="gov-persona-selector-box">
          <label htmlFor="persona-select" className="gov-selector-label">
            Demo Persona:
          </label>
          <select
            id="persona-select"
            className="gov-user-select"
            value={currentUser?.id || ""}
            onChange={handleUserChange}
            aria-label="Select Demo Persona"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {currentUser && (
          <div className="gov-user-profile-badge">
            <div className="gov-user-avatar">
              {getRoleIcon(currentUser.role)}
            </div>
            <div className="gov-user-info">
              <div className="gov-user-name-row">
                <span className="gov-user-name">{currentUser.name}</span>
                <span className={`gov-role-pill gov-role-${currentUser.role}`}>
                  {currentUser.role}
                </span>
              </div>
              <span className="gov-user-email">{currentUser.email}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
