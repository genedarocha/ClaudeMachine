"""
Database & Queue Manager for Automation 1 (Video Content Engine)
Supports SQLite database tables and CSV synchronization.
"""

import sqlite3
import csv
import os
import json
from datetime import datetime
from typing import List, Dict, Optional, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "automation_videos.db"))
CSV_FILE = os.getenv("CSV_QUEUE_PATH", os.path.join(BASE_DIR, "video_ideas_queue.csv"))

def init_db(db_path: str = DB_FILE) -> None:
    """Initializes the SQLite database with the video queue and execution log tables."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Table 1: Video Ideas Queue
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS video_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_idea TEXT NOT NULL,
        target_audience TEXT,
        soundscape TEXT DEFAULT 'Gamma Retention Pulse (40Hz)',
        video_engine TEXT DEFAULT 'LT25',
        cta_type TEXT DEFAULT 'Visit wiredvibe.ai',
        scheduled_date TEXT,
        status TEXT DEFAULT 'pending', -- pending, rendering, published, failed, skipped
        rendered_video_url TEXT,
        generated_title TEXT,
        generated_description TEXT,
        generated_cta TEXT,
        generated_hashtags TEXT,
        critique_iteration INTEGER DEFAULT 0,
        published_channels TEXT, -- JSON string array of successfully posted channels
        error_log TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Table 2: Multi-Platform Publishing Audit Log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS publish_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        queue_id INTEGER,
        platform TEXT NOT NULL, -- X, YouTube, LinkedIn_Personal, LinkedIn_Company, Facebook, TikTok
        status TEXT NOT NULL, -- success, failed
        post_id_or_url TEXT,
        payload_data TEXT,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (queue_id) REFERENCES video_queue(id)
    )
    """)
    
    conn.commit()
    conn.close()

def sync_csv_to_db(csv_path: str = CSV_FILE, db_path: str = DB_FILE) -> int:
    """Loads records from CSV file into SQLite queue if not already present."""
    init_db(db_path)
    if not os.path.exists(csv_path):
        return 0
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    imported_count = 0
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            topic = row.get("topic_idea", "").strip()
            if not topic:
                continue
            
            # Check if exists
            cursor.execute("SELECT id FROM video_queue WHERE topic_idea = ?", (topic,))
            existing = cursor.fetchone()
            if not existing:
                cursor.execute("""
                INSERT INTO video_queue (
                    topic_idea, target_audience, soundscape, video_engine, 
                    cta_type, scheduled_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    topic,
                    row.get("target_audience", "General SaaS / Creators"),
                    row.get("soundscape", "Gamma Retention Pulse (40Hz)"),
                    row.get("video_engine", "LT25"),
                    row.get("cta_type", "Visit wiredvibe.ai"),
                    row.get("scheduled_date", datetime.now().strftime("%Y-%m-%d %H:%M")),
                    row.get("status", "pending")
                ))
                imported_count += 1
                
    conn.commit()
    conn.close()
    return imported_count

def get_next_pending_idea(db_path: str = DB_FILE) -> Optional[Dict[str, Any]]:
    """Fetches the oldest pending idea from the database queue."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM video_queue 
    WHERE status = 'pending' 
    ORDER BY id ASC 
    LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_queue_item(item_id: int, updates: Dict[str, Any], db_path: str = DB_FILE) -> None:
    """Updates status, generated metadata, and results for a queue item."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    updates["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    fields = ", ".join([f"{k} = ?" for k in updates.keys()])
    values = list(updates.values()) + [item_id]
    
    cursor.execute(f"UPDATE video_queue SET {fields} WHERE id = ?", values)
    conn.commit()
    conn.close()

def log_publish_result(queue_id: int, platform: str, status: str, post_url: str = "", error: str = "", db_path: str = DB_FILE) -> None:
    """Records the individual platform publishing outcome."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT INTO publish_logs (queue_id, platform, status, post_id_or_url, error_message)
    VALUES (?, ?, ?, ?, ?)
    """, (queue_id, platform, status, post_url, error))
    
    conn.commit()
    conn.close()

def export_db_to_csv(csv_path: str = CSV_FILE, db_path: str = DB_FILE) -> None:
    """Dumps all database items back to CSV."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM video_queue ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return
        
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(rows[0].keys())
        for row in rows:
            writer.writerow(list(row))
