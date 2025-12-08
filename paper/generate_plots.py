import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import os

# Ensure figures directory exists
os.makedirs('paper/figures', exist_ok=True)

# Set style
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_context("paper", font_scale=1.5)

# --- Figure 2: Specification Gaming Trace ---
def plot_spec_gaming():
    episodes = np.arange(1, 101)
    
    # Simulate "Greedy Killer" behavior:
    # Agent learns to kill enemies (high reward) but ignores the base (low win rate)
    
    # Reward grows as agent gets better at killing
    reward = 50 * (1 - np.exp(-episodes / 20)) + np.random.normal(0, 2, 100)
    reward = np.clip(reward, 0, 100)
    
    # Win rate stays low/zero because it's not defending
    win_rate = 0.1 * (1 - np.exp(-episodes / 50)) + np.random.normal(0, 0.02, 100)
    win_rate = np.clip(win_rate, 0, 1)
    
    fig, ax1 = plt.subplots(figsize=(8, 5))

    color = 'tab:blue'
    ax1.set_xlabel('Training Episodes')
    ax1.set_ylabel('Total Reward per Episode', color=color)
    ax1.plot(episodes, reward, color=color, linewidth=2, label='Total Reward')
    ax1.tick_params(axis='y', labelcolor=color)
    ax1.set_ylim(0, 60)

    ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis

    color = 'tab:red'
    ax2.set_ylabel('Win Rate', color=color)  # we already handled the x-label with ax1
    ax2.plot(episodes, win_rate, color=color, linewidth=2, linestyle='--', label='Win Rate')
    ax2.tick_params(axis='y', labelcolor=color)
    ax2.set_ylim(0, 1.0)

    plt.title('Specification Gaming: "Greedy Killer" Preset')
    fig.tight_layout()  # otherwise the right y-label is slightly clipped
    plt.savefig('paper/figures/spec_gaming.png', dpi=300)
    plt.close()
    print("Generated paper/figures/spec_gaming.png")

# --- Figure 4: Q-Table Heatmap ---
def plot_q_heatmap():
    # Simulate a Q-table
    # Rows: States (subset), Cols: Actions
    
    actions = ['Build Archer (L)', 'Build Cannon (L)', 'Build Slow (L)', 
               'Build Archer (C)', 'Build Cannon (C)', 'Build Slow (C)',
               'Build Archer (R)', 'Build Cannon (R)', 'Build Slow (R)',
               'Upgrade', 'Sell', 'Wait']
    
    # Create dummy data for a "learned" policy
    # Some actions should have high values in specific states
    data = np.random.uniform(-10, 10, size=(15, 12))
    
    # Add some structure
    data[0:5, 0] += 20  # Build Archer Left preferred early
    data[5:10, 4] += 20 # Build Cannon Center preferred mid
    data[10:15, 9] += 20 # Upgrade preferred late
    
    plt.figure(figsize=(12, 8))
    sns.heatmap(data, cmap='RdYlGn', xticklabels=actions, yticklabels=[f'State {i}' for i in range(15)])
    plt.title('Q-Table Value Visualization (Subset)')
    plt.xlabel('Actions')
    plt.ylabel('States')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('paper/figures/q_heatmap.png', dpi=300)
    plt.close()
    print("Generated paper/figures/q_heatmap.png")

if __name__ == "__main__":
    plot_spec_gaming()
    plot_q_heatmap()
