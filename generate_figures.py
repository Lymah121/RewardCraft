"""
generate_figures.py — RewardCraft Paper Figure Generator
=========================================================
Runs REAL training sessions (using the actual backend code) with two preset
reward configurations, then produces:

  figures/spec_gaming.png  — learning curve comparison showing spec gaming
  figures/q_heatmap.png    — Q-table heatmap after training (Balanced preset)

Run from the project root:
    cd "reward craft"
    python3 generate_figures.py
"""

import sys, os, random, numpy as np
from pathlib import Path

# ── Path setup ────────────────────────────────────────────────────────────────
BACKEND = Path(__file__).parent / "code" / "backend"
PAPER   = Path(__file__).parent / "paper"
FIGURES = PAPER / "figures"
FIGURES.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(BACKEND))

from ai.q_learning     import QLearningAgent, DEFAULT_ACTION_NAMES
from ai.reward_function import RewardCalculator
from ai.trainer        import TrainingCoordinator
from game.state_encoder import StateEncoder

# ── Preset reward configurations ──────────────────────────────────────────────
PRESETS = {
    "Balanced": {
        "enemy_defeated":     10.0,
        "enemy_reached_base": -50.0,
        "tower_built":        -2.0,
        "gold_saved":          1.0,
        "wave_completed":     20.0,
        "game_won":          100.0,
        "game_lost":        -100.0,
        "boss_defeated":      50.0,
        "tower_upgraded":     -5.0,
        "special_tower_built":-10.0,
    },
    "Greedy Killer": {
        "enemy_defeated":     50.0,   # very high kill reward → spec gaming
        "enemy_reached_base":  -5.0,  # tiny leak penalty
        "tower_built":         -1.0,
        "gold_saved":           0.5,
        "wave_completed":       5.0,
        "game_won":            20.0,
        "game_lost":          -10.0,  # losing barely hurts
        "boss_defeated":       80.0,
        "tower_upgraded":      -1.0,
        "special_tower_built": -1.0,
    },
    "Gold Hoarder": {
        "enemy_defeated":      5.0,
        "enemy_reached_base": -20.0,
        "tower_built":        -30.0,  # heavy penalty for building
        "gold_saved":          10.0,  # reward saving gold
        "wave_completed":       5.0,
        "game_won":            50.0,
        "game_lost":          -50.0,
        "boss_defeated":       20.0,
        "tower_upgraded":     -20.0,
        "special_tower_built":-20.0,
    },
}

# ── Training runner ────────────────────────────────────────────────────────────
def run_training(preset_name: str, reward_config: dict, n_episodes: int = 150,
                 seed: int = 42) -> tuple[list, list, object]:
    """Run a training session and return (rewards, victories, final_agent)."""
    random.seed(seed)
    np.random.seed(seed)

    agent = QLearningAgent(
        n_actions=len(DEFAULT_ACTION_NAMES),
        learning_rate=0.1,
        discount_factor=0.95,
        epsilon=1.0,
        action_names=DEFAULT_ACTION_NAMES,
    )
    encoder   = StateEncoder()
    calculator = RewardCalculator(reward_config)

    coordinator = TrainingCoordinator(
        agent=agent,
        state_encoder=encoder,
        reward_calculator=calculator,
        progress_callback=None,   # no WebSocket needed
    )

    print(f"  Training '{preset_name}' ({n_episodes} episodes)…", flush=True)
    coordinator.train(
        num_episodes=n_episodes,
        speed_multiplier=100.0,   # max speed (no sleep delays)
        epsilon_decay=0.99,
        min_epsilon=0.01,
    )
    print(f"  Done. Win rate: {sum(coordinator.episode_victories)/n_episodes:.1%}")
    return coordinator.episode_rewards, coordinator.episode_victories, agent


# ── Smooth helper ─────────────────────────────────────────────────────────────
def smooth(data: list, window: int = 10) -> np.ndarray:
    arr = np.array(data, dtype=float)
    kernel = np.ones(window) / window
    return np.convolve(arr, kernel, mode="valid")


# ── FIGURE 1 — Specification Gaming Trace ────────────────────────────────────
def make_spec_gaming_figure(results: dict, n_episodes: int):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.gridspec as gridspec

    W = 15  # smoothing window
    episodes_smooth = np.arange(W, n_episodes + 1)

    fig = plt.figure(figsize=(7.2, 4.0), dpi=180)
    gs  = gridspec.GridSpec(1, 2, figure=fig, wspace=0.38)
    ax1 = fig.add_subplot(gs[0, 0])
    ax2 = fig.add_subplot(gs[0, 1])

    palette = {
        "Balanced":     ("#2563eb", "o"),
        "Greedy Killer":("#dc2626", "s"),
        "Gold Hoarder": ("#d97706", "^"),
    }

    for preset, (rewards, victories, _) in results.items():
        color, marker = palette[preset]
        smooth_rewards = smooth(rewards,   W)
        smooth_wins    = smooth([float(v) for v in victories], W)

        ax1.plot(episodes_smooth, smooth_rewards, color=color,
                 label=preset, linewidth=1.6, alpha=0.92)
        ax2.plot(episodes_smooth, smooth_wins * 100, color=color,
                 label=preset, linewidth=1.6, alpha=0.92)

    # Panel A — Episode Reward
    ax1.set_xlabel("Episode", fontsize=9)
    ax1.set_ylabel("Avg. Episode Reward (smoothed)", fontsize=9)
    ax1.set_title("(a) Cumulative Episode Reward", fontsize=9, fontweight="bold")
    ax1.legend(fontsize=7.5, framealpha=0.85)
    ax1.grid(True, alpha=0.25, linestyle="--")
    ax1.spines[["top","right"]].set_visible(False)

    # Panel B — Win Rate
    ax2.set_xlabel("Episode", fontsize=9)
    ax2.set_ylabel("Win Rate % (smoothed)", fontsize=9)
    ax2.set_title("(b) Win Rate", fontsize=9, fontweight="bold")
    ax2.set_ylim(-5, 105)
    ax2.legend(fontsize=7.5, framealpha=0.85)
    ax2.grid(True, alpha=0.25, linestyle="--")
    ax2.spines[["top","right"]].set_visible(False)

    # Annotation highlighting the spec gaming gap
    gk_rewards = smooth(results["Greedy Killer"][0], W)
    gk_wins    = smooth([float(v) for v in results["Greedy Killer"][1]], W) * 100
    peak_ep    = int(episodes_smooth[np.argmax(gk_rewards)])
    ax2.annotate(
        "High reward,\nlow wins\n← spec gaming",
        xy=(peak_ep, gk_wins[np.argmax(gk_rewards)]),
        xytext=(peak_ep + 12, 35),
        fontsize=7,
        color="#dc2626",
        arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.0),
    )

    fig.suptitle(
        "Specification gaming: 'Greedy Killer' accumulates reward while win rate stays low",
        fontsize=8.5, y=1.01, fontweight="bold"
    )

    out = FIGURES / "spec_gaming.png"
    plt.savefig(out, bbox_inches="tight", dpi=180)
    plt.close()
    print(f"  Saved → {out}")


# ── FIGURE 2 — Q-Table Heatmap ────────────────────────────────────────────────
def make_q_heatmap_figure(agent):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.colors as mcolors

    viz = agent.get_q_table_for_visualization()
    q_vals   = np.array(viz["q_values"])       # shape (n_states_visited, n_actions)
    states   = viz["states"]
    actions  = viz["actions"]

    if q_vals.size == 0:
        print("  WARNING: Q-table is empty — cannot generate heatmap")
        return

    # Sort states by total absolute Q-value (most-visited/interesting first)
    row_magnitude = np.sum(np.abs(q_vals), axis=1)
    top_n = min(30, q_vals.shape[0])
    top_idx = np.argsort(row_magnitude)[::-1][:top_n]
    q_top     = q_vals[top_idx]
    state_top = [states[i] for i in top_idx]

    # Friendly action labels
    ACTION_LABELS = {
        "BUILD_ARCHER_LEFT": "Archer L", "BUILD_ARCHER_CENTER": "Archer C",
        "BUILD_ARCHER_RIGHT":"Archer R", "BUILD_CANNON_LEFT":   "Cannon L",
        "BUILD_CANNON_CENTER":"Cannon C","BUILD_CANNON_RIGHT":  "Cannon R",
        "BUILD_SLOW_LEFT":   "Slow L",  "BUILD_SLOW_CENTER":   "Slow C",
        "BUILD_SLOW_RIGHT":  "Slow R",  "UPGRADE_LEFT":        "Upg L",
        "UPGRADE_CENTER":    "Upg C",   "UPGRADE_RIGHT":       "Upg R",
        "SAVE":              "Save",    "SELL_OLDEST":         "Sell",
    }
    xlabels = [ACTION_LABELS.get(a, a) for a in actions]

    # Friendly state labels (parse the tuple string)
    def fmt_state(s):
        try:
            # State key format: "state_G_E_T_W_Thr_Slow" e.g. "state_2_0_1_1_0_1"
            parts = s.replace("state_", "").split("_")
            gold   = ["Poor","OK","Rich"][int(parts[0])]
            enm    = ["None","Few","Many"][int(parts[1])]
            twr    = ["0 twrs","1-2","3+"][int(parts[2])]
            wave   = ["Early","Mid","Late"][int(parts[3])]
            threat = ["Lo Thr","MedThr","Hi Thr"][int(parts[4])]
            slow   = "Slow✓" if int(parts[5]) else "Slow✗"
            return f"G:{gold} E:{enm} T:{twr}\n{wave} {threat} {slow}"
        except Exception:
            return s[:20]

    ylabels = [fmt_state(s) for s in state_top]

    # Diverging colormap centred on zero
    vmax = max(abs(q_top.min()), abs(q_top.max()), 1)
    norm = mcolors.TwoSlopeNorm(vmin=-vmax, vcenter=0, vmax=vmax)

    fig_h = max(5.0, top_n * 0.28 + 1.2)
    fig, ax = plt.subplots(figsize=(7.2, fig_h), dpi=180)

    im = ax.imshow(q_top, aspect="auto", cmap="RdYlGn", norm=norm,
                   interpolation="nearest")

    # Annotate best action per row with a star
    for row in range(top_n):
        best_col = int(np.argmax(q_top[row]))
        ax.text(best_col, row, "★", ha="center", va="center",
                fontsize=6.5, color="white", fontweight="bold")

    ax.set_xticks(range(len(actions)))
    ax.set_xticklabels(xlabels, rotation=45, ha="right", fontsize=7)
    ax.set_yticks(range(top_n))
    ax.set_yticklabels(ylabels, fontsize=5.5)
    ax.set_xlabel("Action", fontsize=9)
    ax.set_ylabel("State (top 30 by |Q| magnitude)", fontsize=9)
    ax.set_title(
        "Q-Table Heatmap after Training (Balanced preset, 150 episodes)\n"
        "Green = high Q-value (preferred), Red = low (avoided), ★ = best action",
        fontsize=8.5, fontweight="bold"
    )

    cbar = fig.colorbar(im, ax=ax, pad=0.01, shrink=0.85)
    cbar.set_label("Q-value", fontsize=8)
    cbar.ax.tick_params(labelsize=7)

    plt.tight_layout()
    out = FIGURES / "q_heatmap.png"
    plt.savefig(out, bbox_inches="tight", dpi=180)
    plt.close()
    print(f"  Saved → {out}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    N_EPISODES = 300
    results = {}

    print("\n=== RewardCraft Figure Generator ===\n")
    for name, config in PRESETS.items():
        rewards, victories, agent = run_training(name, config, N_EPISODES)
        results[name] = (rewards, victories, agent)

    print("\nGenerating figures…")
    make_spec_gaming_figure(results, N_EPISODES)
    make_q_heatmap_figure(results["Balanced"][2])    # heatmap from Balanced agent

    print("\n✅ Done! Both figures saved to paper/figures/")
    print("   spec_gaming.png  — specification gaming trace (3 presets)")
    print("   q_heatmap.png    — Q-table heatmap (Balanced, 150 eps)")


if __name__ == "__main__":
    main()
