-- Initial Schema for Residential Community Hub
-- Multi-Tenant SaaS Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- ============================================
-- SOCIETIES TABLE
-- ============================================
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    total_buildings INTEGER NOT NULL DEFAULT 0,
    total_apartments INTEGER NOT NULL DEFAULT 0,
    subscription_plan VARCHAR(20) DEFAULT 'FREE',
    subscription_status VARCHAR(20) DEFAULT 'TRIAL',
    trial_ends_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_societies_active ON societies(is_active);
CREATE INDEX idx_societies_subscription ON societies(subscription_status);
CREATE INDEX idx_societies_owner ON societies(owner_id);

-- ============================================
-- BUILDINGS TABLE
-- ============================================
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    total_floors INTEGER NOT NULL DEFAULT 1,
    apartments_per_floor INTEGER NOT NULL DEFAULT 1,
    total_apartments INTEGER NOT NULL DEFAULT 1,
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buildings_society ON buildings(society_id);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(7) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    profile_photo_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'RESIDENT',
    apartment_number VARCHAR(20),
    building_name VARCHAR(50),
    society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMP,
    refresh_token VARCHAR(500),
    refresh_token_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_society ON users(society_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);

-- ============================================
-- USER PERMISSIONS TABLE
-- ============================================
CREATE TABLE user_permissions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, permission)
);

CREATE INDEX idx_permissions_user ON user_permissions(user_id);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50),
    username VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    society_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_society ON audit_logs(society_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- VISITORS TABLE
-- ============================================
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    purpose VARCHAR(200) NOT NULL,
    host_id UUID NOT NULL REFERENCES users(id),
    host_name VARCHAR(100),
    host_apartment VARCHAR(50),
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    vehicle_number VARCHAR(20),
    photo_url VARCHAR(500),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visitors_society ON visitors(society_id);
CREATE INDEX idx_visitors_host ON visitors(host_id);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_created ON visitors(created_at);

-- ============================================
-- MAINTENANCE REQUESTS TABLE
-- ============================================
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_by_name VARCHAR(100),
    apartment_number VARCHAR(50),
    assigned_to UUID REFERENCES users(id),
    assigned_to_name VARCHAR(100),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    completed_at TIMESTAMP,
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_society ON maintenance_requests(society_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requested_by ON maintenance_requests(requested_by);
CREATE INDEX idx_maintenance_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX idx_maintenance_created ON maintenance_requests(created_at);

-- ============================================
-- MAINTENANCE IMAGES TABLE
-- ============================================
CREATE TABLE maintenance_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_images_request ON maintenance_images(request_id);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    priority VARCHAR(20) NOT NULL DEFAULT 'LOW',
    posted_by UUID NOT NULL REFERENCES users(id),
    posted_by_name VARCHAR(100),
    target_audience VARCHAR(100)[] DEFAULT ARRAY['ALL']::VARCHAR[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP,
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_society ON announcements(society_id);
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_created ON announcements(created_at);

-- ============================================
-- ANNOUNCEMENT ATTACHMENTS TABLE
-- ============================================
CREATE TABLE announcement_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcement_attachments ON announcement_attachments(announcement_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_id VARCHAR(50),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_society ON notifications(society_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- SOCIAL POSTS TABLE
-- ============================================
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    author_name VARCHAR(100),
    author_photo_url VARCHAR(500),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_posts_society ON social_posts(society_id);
CREATE INDEX idx_social_posts_author ON social_posts(author_id);
CREATE INDEX idx_social_posts_created ON social_posts(created_at);

-- ============================================
-- POST IMAGES TABLE
-- ============================================
CREATE TABLE post_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_images_post ON post_images(post_id);

-- ============================================
-- POST REACTIONS TABLE
-- ============================================
CREATE TABLE post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'LIKE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user ON post_reactions(user_id);

-- ============================================
-- POST COMMENTS TABLE
-- ============================================
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(100),
    user_photo_url VARCHAR(500),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES post_comments(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_society ON messages(society_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description VARCHAR(500),
    due_date DATE,
    paid_at TIMESTAMP,
    transaction_id VARCHAR(100),
    payment_method VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_society ON payments(society_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_id UUID REFERENCES payments(id),
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_society ON subscriptions(society_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- FACILITY BOOKINGS TABLE
-- ============================================
CREATE TABLE facility_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(50) NOT NULL,
    facility_name VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    user_name VARCHAR(100),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose VARCHAR(500),
    attendees INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facility_bookings_society ON facility_bookings(society_id);
CREATE INDEX idx_facility_bookings_facility ON facility_bookings(facility_id);
CREATE INDEX idx_facility_bookings_user ON facility_bookings(user_id);
CREATE INDEX idx_facility_bookings_date ON facility_bookings(booking_date);

-- ============================================
-- ANALYTICS DAILY STATS TABLE
-- ============================================
CREATE TABLE analytics_daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    visitors_count INTEGER DEFAULT 0,
    maintenance_requests_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    active_users_count INTEGER DEFAULT 0,
    new_users_count INTEGER DEFAULT 0,
    payments_total DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(society_id, stat_date)
);

CREATE INDEX idx_analytics_society ON analytics_daily_stats(society_id);
CREATE INDEX idx_analytics_date ON analytics_daily_stats(stat_date);

-- ============================================
-- CREATE DEFAULT PROJECT OWNER
-- ============================================
INSERT INTO users (id, user_id, username, email, password, first_name, last_name, role, is_active, email_verified)
VALUES (
    uuid_generate_v4(),
    'ADMIN01',
    'iprincekumark',
    'princevrse@gmail.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', -- ADMIN@mI5jVTCZn (bcrypt encoded)
    'Prince',
    'Kumar',
    'PROJECT_OWNER',
    true,
    true
);

-- ============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for all tables
CREATE TRIGGER update_societies_timestamp BEFORE UPDATE ON societies
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_buildings_timestamp BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_visitors_timestamp BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_maintenance_requests_timestamp BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_announcements_timestamp BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_social_posts_timestamp BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_post_comments_timestamp BEFORE UPDATE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subscriptions_timestamp BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_facility_bookings_timestamp BEFORE UPDATE ON facility_bookings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_analytics_daily_stats_timestamp BEFORE UPDATE ON analytics_daily_stats
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
