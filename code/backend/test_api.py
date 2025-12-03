"""
Quick test script for API endpoints
Verifies that the backend is working correctly
"""

from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)


def test_health_check():
    """Test health endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✅ Health check passed")


def test_info_endpoint():
    """Test info endpoint"""
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert data["ai"]["state_space_size"] == 486
    assert len(data["ai"]["actions"]) >= 12  # Phase 3 expanded action set
    print("✅ Info endpoint passed")


def test_initialize():
    """Test initialization"""
    response = client.post("/api/initialize")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "initialized"
    assert data["state_space_size"] == 486
    print("✅ Initialize passed")


def test_reward_config():
    """Test reward configuration"""
    # Initialize first
    client.post("/api/initialize")

    # Update reward config
    new_config = {
        "enemy_defeated": 20,
        "enemy_reached_base": -100,
        "tower_built": -5,
        "gold_saved": 2,
        "wave_completed": 50
    }

    response = client.post("/api/ai/reward-config", json=new_config)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "updated"
    print("✅ Reward config update passed")

    # Get reward config
    response = client.get("/api/ai/reward-config")
    assert response.status_code == 200
    data = response.json()
    assert data["config"]["enemy_defeated"] == 20
    print("✅ Reward config get passed")


def test_q_table():
    """Test Q-table endpoint"""
    # Initialize first
    client.post("/api/initialize")

    response = client.get("/api/ai/q-table")
    assert response.status_code == 200
    data = response.json()
    assert data["state_space_size"] == 486
    assert data["states_visited"] == 0  # No training yet
    print("✅ Q-table endpoint passed")


def test_training_status():
    """Test training status endpoint"""
    response = client.get("/api/training/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_training" in data
    print("✅ Training status passed")


def run_all_tests():
    """Run all API tests"""
    print("🧪 Testing RewardCraft API Endpoints\n")

    try:
        test_health_check()
        test_info_endpoint()
        test_initialize()
        test_reward_config()
        test_q_table()
        test_training_status()

        print("\n✅ ALL API TESTS PASSED!")
        print("\nBackend is ready for frontend integration.")
        return True

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
