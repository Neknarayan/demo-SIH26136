from datetime import date, timedelta
from app.services.decision_support import compute_decision_support

def test_01_officer_can_create_challenge(client):
    """1. Officer can create challenge"""
    response = client.post(
        "/challenges",
        headers=client.auth_headers(1),  # Officer
        json={
            "title": "Smart Water Monitoring Test",
            "description": "Deploy automated IoT sensor telemetry across urban grids.",
            "outcomes": "Reduce water loss by 15%.",
            "constraints": "SCADA protocol compatibility.",
            "budget_band": "₹25L - ₹50L",
            "required_sector": "Water Technology",
            "dpiit_required": True,
            "status": "published"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Smart Water Monitoring Test"
    assert data["officer_id"] == 1

def test_02_startup_cannot_create_challenge(client):
    """2. Startup cannot create challenge (returns 403)"""
    response = client.post(
        "/challenges",
        headers=client.auth_headers(3),  # Startup
        json={
            "title": "Unauthorized Challenge",
            "description": "This should fail because role is startup.",
            "outcomes": "None",
            "constraints": "None",
            "budget_band": "₹10L",
            "required_sector": "Water",
            "dpiit_required": False,
            "status": "published"
        }
    )
    assert response.status_code == 403

def test_03_startup_can_apply(client):
    """3. Startup can apply to published challenge"""
    # Create challenge as officer first
    c_res = client.post(
        "/challenges",
        headers=client.auth_headers(1),
        json={
            "title": "Challenge for App Test",
            "description": "Description for test challenge.",
            "outcomes": "Measurable outcomes.",
            "constraints": "Technical constraints.",
            "budget_band": "₹25L",
            "required_sector": "Water Technology",
            "dpiit_required": True,
            "status": "published"
        }
    )
    challenge_id = c_res.json()["id"]

    # Apply as startup (User 3 -> Startup 1)
    app_res = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={
            "challenge_id": challenge_id,
            "proposal_text": "Detailed proposal to deploy AI acoustic sensors along main pipelines."
        }
    )
    assert app_res.status_code == 201
    assert app_res.json()["status"] == "submitted"
    assert app_res.json()["startup_id"] == 1

def test_04_duplicate_application_is_rejected(client):
    """4. Duplicate application by same startup is rejected (409 Conflict)"""
    c_res = client.post(
        "/challenges",
        headers=client.auth_headers(1),
        json={
            "title": "Duplicate Challenge Test",
            "description": "Testing duplicate applications prevention.",
            "outcomes": "Outcomes.",
            "constraints": "Constraints.",
            "budget_band": "₹10L",
            "required_sector": "Water Technology",
            "dpiit_required": False,
            "status": "published"
        }
    )
    challenge_id = c_res.json()["id"]

    # First application succeeds
    res1 = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={"challenge_id": challenge_id, "proposal_text": "First proposal attempt."}
    )
    assert res1.status_code == 201

    # Second application fails with 409
    res2 = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={"challenge_id": challenge_id, "proposal_text": "Duplicate proposal attempt."}
    )
    assert res2.status_code == 409

def test_05_evaluator_can_score(client):
    """5. Evaluator can score an application (0-100)"""
    c_res = client.post(
        "/challenges",
        headers=client.auth_headers(1),
        json={
            "title": "Scoring Challenge",
            "description": "Evaluation test challenge.",
            "outcomes": "Outcomes.",
            "constraints": "Constraints.",
            "budget_band": "₹15L",
            "required_sector": "Water Technology",
            "dpiit_required": False,
            "status": "published"
        }
    )
    challenge_id = c_res.json()["id"]

    app_res = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={"challenge_id": challenge_id, "proposal_text": "Proposal for evaluation."}
    )
    application_id = app_res.json()["id"]

    eval_res = client.post(
        "/evaluations",
        headers=client.auth_headers(2),  # Evaluator
        json={
            "application_id": application_id,
            "score": 88,
            "notes": "Strong methodology and proven telemetry architecture."
        }
    )
    assert eval_res.status_code == 201
    assert eval_res.json()["score"] == 88

def test_06_duplicate_evaluation_is_rejected(client):
    """6. Duplicate evaluation is rejected (409 Conflict)"""
    c_res = client.post(
        "/challenges",
        headers=client.auth_headers(1),
        json={
            "title": "Dup Eval Challenge",
            "description": "Duplicate eval test.",
            "outcomes": "Outcomes.",
            "constraints": "Constraints.",
            "budget_band": "₹15L",
            "required_sector": "Water Technology",
            "dpiit_required": False,
            "status": "published"
        }
    )
    challenge_id = c_res.json()["id"]

    app_res = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={"challenge_id": challenge_id, "proposal_text": "Proposal for dup evaluation."}
    )
    application_id = app_res.json()["id"]

    res1 = client.post(
        "/evaluations",
        headers=client.auth_headers(2),
        json={"application_id": application_id, "score": 85, "notes": "First score."}
    )
    assert res1.status_code == 201

    res2 = client.post(
        "/evaluations",
        headers=client.auth_headers(2),
        json={"application_id": application_id, "score": 90, "notes": "Duplicate score."}
    )
    assert res2.status_code == 409

def test_07_officer_can_shortlist(client):
    """7. Officer can shortlist an application"""
    c_res = client.post(
        "/challenges",
        headers=client.auth_headers(1),
        json={
            "title": "Shortlist Challenge",
            "description": "Challenge for shortlist test.",
            "outcomes": "Outcomes.",
            "constraints": "Constraints.",
            "budget_band": "₹20L",
            "required_sector": "Water Technology",
            "dpiit_required": False,
            "status": "published"
        }
    )
    challenge_id = c_res.json()["id"]

    app_res = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={"challenge_id": challenge_id, "proposal_text": "Proposal to shortlist."}
    )
    application_id = app_res.json()["id"]

    patch_res = client.patch(
        f"/applications/{application_id}/status",
        headers=client.auth_headers(1),
        json={"status": "shortlisted"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "shortlisted"

def test_08_pilot_requires_shortlisted_application(client):
    """8. Pilot requires shortlisted application (fails on submitted/rejected)"""
    c_res = client.post(
        "/challenges",
        headers=client.auth_headers(1),
        json={
            "title": "Pilot Shortlist Requirement",
            "description": "Testing shortlisted constraint.",
            "outcomes": "Outcomes.",
            "constraints": "Constraints.",
            "budget_band": "₹20L",
            "required_sector": "Water Technology",
            "dpiit_required": False,
            "status": "published"
        }
    )
    challenge_id = c_res.json()["id"]

    app_res = client.post(
        "/applications",
        headers=client.auth_headers(3),
        json={"challenge_id": challenge_id, "proposal_text": "Proposal not yet shortlisted."}
    )
    application_id = app_res.json()["id"]

    # Try creating pilot while status is 'submitted' -> 422
    pilot_res = client.post(
        "/pilots",
        headers=client.auth_headers(1),
        json={
            "application_id": application_id,
            "scope": "Municipal pilot across Zone 4.",
            "timeline_start": str(date.today()),
            "timeline_end": str(date.today() + timedelta(days=90))
        }
    )
    assert pilot_res.status_code == 422

    # Now shortlist the application
    client.patch(
        f"/applications/{application_id}/status",
        headers=client.auth_headers(1),
        json={"status": "shortlisted"}
    )

    # Now pilot creation succeeds
    pilot_res2 = client.post(
        "/pilots",
        headers=client.auth_headers(1),
        json={
            "application_id": application_id,
            "scope": "Municipal pilot across Zone 4.",
            "timeline_start": str(date.today()),
            "timeline_end": str(date.today() + timedelta(days=90))
        }
    )
    assert pilot_res2.status_code == 201

def test_09_officer_can_create_kpi(client):
    """9. Officer can create KPI for a pilot"""
    # Create challenge, app, shortlist, pilot
    c_res = client.post("/challenges", headers=client.auth_headers(1), json={
        "title": "KPI Challenge", "description": "Description text for challenge.", "outcomes": "Outcomes achieved", "constraints": "Constraints noted",
        "budget_band": "₹20L", "required_sector": "Water Technology", "dpiit_required": False, "status": "published"
    })
    app_res = client.post("/applications", headers=client.auth_headers(3), json={"challenge_id": c_res.json()["id"], "proposal_text": "Proposal text."})
    app_id = app_res.json()["id"]
    client.patch(f"/applications/{app_id}/status", headers=client.auth_headers(1), json={"status": "shortlisted"})
    pilot_res = client.post("/pilots", headers=client.auth_headers(1), json={
        "application_id": app_id, "scope": "Pilot Scope", "timeline_start": str(date.today()), "timeline_end": str(date.today() + timedelta(days=60))
    })
    pilot_id = pilot_res.json()["id"]

    kpi_res = client.post(
        f"/pilots/{pilot_id}/kpis",
        headers=client.auth_headers(1),
        json={
            "name": "Water Leakage Reduction",
            "target_value": 20.0,
            "unit": "%"
        }
    )
    assert kpi_res.status_code == 201
    assert kpi_res.json()["target_value"] == 20.0

def test_10_startup_can_submit_evidence_for_own_pilot(client):
    """10. Startup can submit evidence for its own pilot"""
    c_res = client.post("/challenges", headers=client.auth_headers(1), json={
        "title": "Evidence Challenge", "description": "Description text for challenge.", "outcomes": "Outcomes achieved", "constraints": "Constraints noted",
        "budget_band": "₹20L", "required_sector": "Water Technology", "dpiit_required": False, "status": "published"
    })
    app_res = client.post("/applications", headers=client.auth_headers(3), json={"challenge_id": c_res.json()["id"], "proposal_text": "Proposal text."})
    app_id = app_res.json()["id"]
    client.patch(f"/applications/{app_id}/status", headers=client.auth_headers(1), json={"status": "shortlisted"})
    pilot_res = client.post("/pilots", headers=client.auth_headers(1), json={
        "application_id": app_id, "scope": "Pilot Scope", "timeline_start": str(date.today()), "timeline_end": str(date.today() + timedelta(days=60))
    })
    pilot_id = pilot_res.json()["id"]
    kpi_res = client.post(f"/pilots/{pilot_id}/kpis", headers=client.auth_headers(1), json={"name": "Sensor Uptime", "target_value": 95.0, "unit": "%"})
    kpi_id = kpi_res.json()["id"]

    ev_res = client.post(
        f"/kpis/{kpi_id}/evidence",
        headers=client.auth_headers(3),  # AquaSense (pilot owner)
        json={
            "submitted_value": 98.2,
            "description": "Telemetry logs over 30 days show 98.2% sensor uptime."
        }
    )
    assert ev_res.status_code == 201
    assert ev_res.json()["status"] == "pending"

def test_11_startup_cannot_submit_evidence_for_other_pilot(client):
    """11. Startup cannot submit evidence for another startup's pilot (403 Forbidden)"""
    c_res = client.post("/challenges", headers=client.auth_headers(1), json={
        "title": "Evidence Auth Challenge", "description": "Description text for challenge.", "outcomes": "Outcomes achieved", "constraints": "Constraints noted",
        "budget_band": "₹20L", "required_sector": "Water Technology", "dpiit_required": False, "status": "published"
    })
    # AquaSense (User 3) owns this application & pilot
    app_res = client.post("/applications", headers=client.auth_headers(3), json={"challenge_id": c_res.json()["id"], "proposal_text": "Proposal text."})
    app_id = app_res.json()["id"]
    client.patch(f"/applications/{app_id}/status", headers=client.auth_headers(1), json={"status": "shortlisted"})
    pilot_res = client.post("/pilots", headers=client.auth_headers(1), json={
        "application_id": app_id, "scope": "Pilot Scope", "timeline_start": str(date.today()), "timeline_end": str(date.today() + timedelta(days=60))
    })
    pilot_id = pilot_res.json()["id"]
    kpi_res = client.post(f"/pilots/{pilot_id}/kpis", headers=client.auth_headers(1), json={"name": "Sensor Uptime", "target_value": 95.0, "unit": "%"})
    kpi_id = kpi_res.json()["id"]

    # User 4 (Other Startup) tries submitting evidence -> 403 Forbidden
    ev_res = client.post(
        f"/kpis/{kpi_id}/evidence",
        headers=client.auth_headers(4),
        json={"submitted_value": 50.0, "description": "Unauthorized evidence submission."}
    )
    assert ev_res.status_code == 403

def test_12_officer_can_approve_reject_evidence(client):
    """12. Officer can approve/reject evidence"""
    c_res = client.post("/challenges", headers=client.auth_headers(1), json={
        "title": "Evidence Approval Challenge", "description": "Description text for challenge.", "outcomes": "Outcomes achieved", "constraints": "Constraints noted",
        "budget_band": "₹20L", "required_sector": "Water Technology", "dpiit_required": False, "status": "published"
    })
    app_res = client.post("/applications", headers=client.auth_headers(3), json={"challenge_id": c_res.json()["id"], "proposal_text": "Proposal text."})
    app_id = app_res.json()["id"]
    client.patch(f"/applications/{app_id}/status", headers=client.auth_headers(1), json={"status": "shortlisted"})
    pilot_res = client.post("/pilots", headers=client.auth_headers(1), json={
        "application_id": app_id, "scope": "Pilot Scope", "timeline_start": str(date.today()), "timeline_end": str(date.today() + timedelta(days=60))
    })
    pilot_id = pilot_res.json()["id"]
    kpi_res = client.post(f"/pilots/{pilot_id}/kpis", headers=client.auth_headers(1), json={"name": "Water Loss Reduction", "target_value": 15.0, "unit": "%"})
    kpi_id = kpi_res.json()["id"]
    ev_res = client.post(f"/kpis/{kpi_id}/evidence", headers=client.auth_headers(3), json={"submitted_value": 17.5, "description": "Field logs."})
    evidence_id = ev_res.json()["id"]

    # Officer approves evidence
    patch_res = client.patch(
        f"/evidence/{evidence_id}/status",
        headers=client.auth_headers(1),
        json={"status": "approved"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "approved"

def test_13_decision_support_calculates_correct_ratio(client):
    """13. Decision support calculates correct ratio (e.g. 2 of 3 KPIs approved = 0.67)"""
    c_res = client.post("/challenges", headers=client.auth_headers(1), json={
        "title": "DS Ratio Challenge", "description": "Description text for challenge.", "outcomes": "Outcomes achieved", "constraints": "Constraints noted",
        "budget_band": "₹20L", "required_sector": "Water Technology", "dpiit_required": False, "status": "published"
    })
    app_res = client.post("/applications", headers=client.auth_headers(3), json={"challenge_id": c_res.json()["id"], "proposal_text": "Proposal text."})
    app_id = app_res.json()["id"]
    client.patch(f"/applications/{app_id}/status", headers=client.auth_headers(1), json={"status": "shortlisted"})
    pilot_res = client.post("/pilots", headers=client.auth_headers(1), json={
        "application_id": app_id, "scope": "Pilot Scope", "timeline_start": str(date.today()), "timeline_end": str(date.today() + timedelta(days=60))
    })
    pilot_id = pilot_res.json()["id"]

    # 3 KPIs
    k1 = client.post(f"/pilots/{pilot_id}/kpis", headers=client.auth_headers(1), json={"name": "KPI 1", "target_value": 10.0, "unit": "%"}).json()["id"]
    k2 = client.post(f"/pilots/{pilot_id}/kpis", headers=client.auth_headers(1), json={"name": "KPI 2", "target_value": 20.0, "unit": "%"}).json()["id"]
    k3 = client.post(f"/pilots/{pilot_id}/kpis", headers=client.auth_headers(1), json={"name": "KPI 3", "target_value": 30.0, "unit": "%"}).json()["id"]

    # Submit and approve evidence for KPI 1 and KPI 2
    ev1 = client.post(f"/kpis/{k1}/evidence", headers=client.auth_headers(3), json={"submitted_value": 12.0, "description": "Ev 1"}).json()["id"]
    ev2 = client.post(f"/kpis/{k2}/evidence", headers=client.auth_headers(3), json={"submitted_value": 22.0, "description": "Ev 2"}).json()["id"]
    ev3 = client.post(f"/kpis/{k3}/evidence", headers=client.auth_headers(3), json={"submitted_value": 10.0, "description": "Ev 3"}).json()["id"]

    client.patch(f"/evidence/{ev1}/status", headers=client.auth_headers(1), json={"status": "approved"})
    client.patch(f"/evidence/{ev2}/status", headers=client.auth_headers(1), json={"status": "approved"})
    client.patch(f"/evidence/{ev3}/status", headers=client.auth_headers(1), json={"status": "rejected"})

    # Check Decision Support
    ds_res = client.get(f"/pilots/{pilot_id}/decision-support", headers=client.auth_headers(1))
    assert ds_res.status_code == 200
    data = ds_res.json()
    assert data["total_kpis"] == 3
    assert data["approved_kpis"] == 2
    assert data["achievement_ratio"] == 0.67
    assert data["recommendation"] == "Extend Pilot"

def test_14_decision_threshold_0_70_recommend_scale():
    """14. Decision threshold >= 0.70 produces 'Recommend Scale'"""
    res1 = compute_decision_support(pilot_id=1, total_kpis=10, approved_kpis=7)
    assert res1.achievement_ratio == 0.70
    assert res1.recommendation == "Recommend Scale"

    res2 = compute_decision_support(pilot_id=1, total_kpis=3, approved_kpis=3)
    assert res2.achievement_ratio == 1.00
    assert res2.recommendation == "Recommend Scale"

def test_15_decision_threshold_0_40_extend_and_discontinue():
    """15. Decision threshold 0.40 - 0.69 produces 'Extend Pilot', < 0.40 produces 'Discontinue'"""
    # 0.40 - 0.69
    res_extend = compute_decision_support(pilot_id=1, total_kpis=5, approved_kpis=2)
    assert res_extend.achievement_ratio == 0.40
    assert res_extend.recommendation == "Extend Pilot"

    # < 0.40
    res_disc = compute_decision_support(pilot_id=1, total_kpis=5, approved_kpis=1)
    assert res_disc.achievement_ratio == 0.20
    assert res_disc.recommendation == "Discontinue"

def test_16_zero_kpis_no_division_by_zero():
    """16. Zero-KPI pilot returns 'Insufficient Data' without division-by-zero"""
    res = compute_decision_support(pilot_id=99, total_kpis=0, approved_kpis=0)
    assert res.achievement_ratio == 0.0
    assert res.recommendation == "Insufficient Data"
    assert "No KPIs have been established" in res.explanation
