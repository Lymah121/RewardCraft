"""
Simple test to verify core components work together
Run this to test the game engine, state encoder, Q-learning, and rewards
"""

from game.engine import TowerDefenseGame
from game.state_encoder import StateEncoder
from ai.q_learning import QLearningAgent
from ai.reward_function import RewardCalculator


def test_game_basic():
    """Test basic game functionality"""
    print("=== Testing Game Engine ===")
    game = TowerDefenseGame()

    print(f"Initial state:")
    print(f"  Gold: {game.gold}")
    print(f"  Lives: {game.lives}")
    print(f"  Enemies: {len(game.enemies)}")
    print(f"  Towers: {len(game.towers)}")

    # Build a tower
    print("\nExecuting BUILD_LEFT...")
    events = game.execute_action("BUILD_LEFT")
    print(f"  Success: {events['action_success']}")
    print(f"  Gold after: {game.gold}")
    print(f"  Towers: {len(game.towers)}")

    # Run a few ticks
    print("\nRunning 600 ticks (10 seconds)...")
    for _ in range(600):
        game.tick()

    state = game.get_state()
    print(f"After 10 seconds:")
    print(f"  Wave: {state['wave']['current']}/{state['wave']['total']}")
    print(f"  Enemies: {len(state['enemies'])}")
    print(f"  Lives: {state['resources']['lives']}")

    print("✅ Game engine works!\n")


def test_state_encoder():
    """Test state encoding"""
    print("=== Testing State Encoder ===")
    game = TowerDefenseGame()
    encoder = StateEncoder()

    # Get initial state
    game_state = game.get_state()
    encoded = encoder.encode(game_state)
    state_key = encoder.get_state_key(encoded)
    label = encoder.get_state_label(state_key)

    print(f"Encoded state: {encoded}")
    print(f"State key: {state_key}")
    print(f"State label: {label}")
    print(f"Total possible states: {encoder.get_state_space_size()}")

    print("✅ State encoder works!\n")


def test_q_learning():
    """Test Q-learning agent"""
    print("=== Testing Q-Learning Agent ===")
    agent = QLearningAgent()
    encoder = StateEncoder()
    game = TowerDefenseGame()

    # Get encoded state
    game_state = game.get_state()
    encoded_state = encoder.encode(game_state)

    # Get action
    valid_action_names = game.get_valid_actions()
    valid_action_indices = agent.get_valid_action_indices(valid_action_names)
    action_idx, was_exploration = agent.get_action(encoded_state, valid_action_indices)
    action = agent.action_names[action_idx]
    print(f"Chosen action: {action} (exploration={was_exploration})")

    # Execute action
    events = game.execute_action(action)

    # Get next state
    next_game_state = game.get_state()
    next_encoded_state = encoder.encode(next_game_state)

    # Update Q-table
    reward = 10  # Dummy reward
    old_q, new_q = agent.update(encoded_state, action_idx, reward, next_encoded_state)

    print(f"Q-value update: {old_q:.2f} → {new_q:.2f}")
    print(f"Total states visited: {len(agent.state_visits)}")

    print("✅ Q-learning agent works!\n")


def test_reward_calculator():
    """Test reward calculation"""
    print("=== Testing Reward Calculator ===")
    config = {
        "enemy_defeated": 10,
        "enemy_reached_base": -50,
        "tower_built": -2,
        "wave_completed": 20
    }
    calc = RewardCalculator(config)

    # Simulate events
    game = TowerDefenseGame()
    old_state = game.get_state()

    game.execute_action("BUILD_LEFT")
    new_state = game.get_state()

    events = {
        "enemies_defeated": 2,
        "action_success": True
    }

    reward, breakdown = calc.calculate(old_state, "BUILD_LEFT", new_state, events)

    print(f"Reward calculation:")
    print(f"  Events: {events}")
    print(f"  Breakdown: {breakdown}")
    print(f"  Total reward: {reward}")

    print("✅ Reward calculator works!\n")


def test_full_episode():
    """Run a short episode to test everything together"""
    print("=== Running Full Episode Test ===")

    game = TowerDefenseGame()
    encoder = StateEncoder()
    agent = QLearningAgent(epsilon=0.5)  # Higher exploration for testing
    reward_config = {
        "enemy_defeated": 10,
        "enemy_reached_base": -50,
        "tower_built": -2,
        "gold_saved": 1,
        "wave_completed": 20
    }
    calc = RewardCalculator(reward_config)

    total_reward = 0
    step = 0

    print("Starting episode...")

    while not game.is_done() and step < 5:  # Only 5 decisions for testing
        # Get current state
        game_state = game.get_state()
        encoded_state = encoder.encode(game_state)

        # Agent chooses action
        valid_action_names = game.get_valid_actions()
        valid_action_indices = agent.get_valid_action_indices(valid_action_names)

        action_idx, was_exploration = agent.get_action(encoded_state, valid_action_indices)
        action = agent.action_names[action_idx]

        # Execute action
        events = game.execute_action(action)

        # Run some game ticks
        for _ in range(300):  # 5 seconds of game time
            tick_events = game.tick()
            events["enemies_defeated"] = events.get("enemies_defeated", 0) + tick_events.get("enemies_defeated", 0)
            events["enemies_reached_base"] = events.get("enemies_reached_base", 0) + tick_events.get("enemies_reached_base", 0)

        # Get next state
        next_game_state = game.get_state()
        next_encoded_state = encoder.encode(next_game_state)

        # Calculate reward
        reward, breakdown = calc.calculate(game_state, action, next_game_state, events)
        total_reward += reward

        # Update Q-table
        old_q, new_q = agent.update(encoded_state, action_idx, reward, next_encoded_state, game.is_done())

        print(f"\nStep {step + 1}:")
        print(f"  Action: {action} (exploration={was_exploration})")
        print(f"  Reward: {reward:.1f}")
        print(f"  Gold: {game.gold}, Lives: {game.lives}")
        print(f"  Q: {old_q:.2f} → {new_q:.2f}")

        step += 1

    print(f"\nEpisode finished!")
    print(f"  Total reward: {total_reward:.1f}")
    print(f"  Final state: Victory={game.victory}, Defeat={game.defeat}")
    print(f"  Q-table size: {len(agent.q_table)} states")

    print("✅ Full episode test works!\n")


if __name__ == "__main__":
    print("🎮 RewardCraft Core Components Test\n")
    print("=" * 50)

    try:
        test_game_basic()
        test_state_encoder()
        test_q_learning()
        test_reward_calculator()
        test_full_episode()

        print("=" * 50)
        print("✅ ALL TESTS PASSED! Core components are working correctly.")
        print("\nNext steps:")
        print("  1. Create FastAPI backend")
        print("  2. Add WebSocket support")
        print("  3. Build React frontend")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
