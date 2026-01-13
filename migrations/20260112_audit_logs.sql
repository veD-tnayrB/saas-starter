-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering by project
CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
-- Index for faster filtering by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
-- Index for faster filtering by action
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
-- Index for faster filtering by entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
-- Index for filtering by time
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
