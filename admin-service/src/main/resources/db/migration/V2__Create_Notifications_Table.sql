CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50),
    reference_id VARCHAR(100)
);

CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_created_at ON notifications(created_at);
