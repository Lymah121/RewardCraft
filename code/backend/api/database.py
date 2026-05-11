"""
Database logger for research purposes.
Logs training sessions and episodes to a local SQLite database.
"""

import sqlite3
import json
import csv
from io import StringIO
from typing import Dict, List, Any
import uuid
import time
from pathlib import Path

# Save DB in the project root
DB_PATH = Path(__file__).parent.parent.parent.parent / "rewardcraft_research.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_uuid TEXT UNIQUE,
            start_time REAL,
            reward_config TEXT,
            hyperparameters TEXT,
            state_space_size INTEGER,
            num_episodes INTEGER
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS episodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_uuid TEXT,
            episode_num INTEGER,
            total_reward REAL,
            victory BOOLEAN,
            steps INTEGER,
            final_wave INTEGER,
            timestamp REAL,
            FOREIGN KEY(session_uuid) REFERENCES sessions(session_uuid)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS reflection_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_uuid TEXT,
            student_name TEXT,
            preset_name TEXT,
            win_rate REAL,
            response TEXT,
            timestamp REAL,
            FOREIGN KEY(session_uuid) REFERENCES sessions(session_uuid)
        )
    ''')
    conn.commit()
    conn.close()

def log_session_start(reward_config: Dict, hyperparameters: Dict, state_space_size: int, num_episodes: int) -> str:
    session_uuid = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO sessions (session_uuid, start_time, reward_config, hyperparameters, state_space_size, num_episodes)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        session_uuid,
        time.time(),
        json.dumps(reward_config),
        json.dumps(hyperparameters),
        state_space_size,
        num_episodes
    ))
    conn.commit()
    conn.close()
    return session_uuid

def log_episode(session_uuid: str, episode_num: int, total_reward: float, victory: bool, steps: int, final_wave: int):
    if not session_uuid:
        return
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO episodes (session_uuid, episode_num, total_reward, victory, steps, final_wave, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        session_uuid,
        episode_num,
        total_reward,
        victory,
        steps,
        final_wave,
        time.time()
    ))
    conn.commit()
    conn.close()

def get_sessions_csv() -> str:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM sessions')
    rows = c.fetchall()
    columns = [description[0] for description in c.description]
    conn.close()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    writer.writerows(rows)
    return output.getvalue()

def get_episodes_csv() -> str:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM episodes')
    rows = c.fetchall()
    columns = [description[0] for description in c.description]
    conn.close()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    writer.writerows(rows)
    return output.getvalue()

def log_reflection(session_uuid: str, student_name: str, preset_name: str, win_rate: float, response: str):
    """Persist a student's post-training reflection response."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO reflection_responses (session_uuid, student_name, preset_name, win_rate, response, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        session_uuid,
        student_name,
        preset_name,
        win_rate,
        response,
        time.time()
    ))
    conn.commit()
    conn.close()

def get_reflections_csv() -> str:
    """Export all reflection responses as CSV for qualitative analysis."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM reflection_responses')
    rows = c.fetchall()
    columns = [description[0] for description in c.description]
    conn.close()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    writer.writerows(rows)
    return output.getvalue()

# Initialize DB on module load
init_db()
