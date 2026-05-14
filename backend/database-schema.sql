-- Event Discovery & Booking Platform - Database Schema
-- Production-ready MySQL schema for university event management system

-- Create database
CREATE DATABASE IF NOT EXISTS event_discovery_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE event_discovery_db;

-- Roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    INDEX idx_role_name (name)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('STUDENT', 'Regular student user'),
('COLLEGE_ADMIN', 'College administrator'),
('EVENT_ORGANIZER', 'Event organizer'),
('EXTERNAL_PARTNER', 'External college partner'),
('SUPER_ADMIN', 'System super administrator');

-- Colleges table
CREATE TABLE colleges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('UNIVERSITY', 'COLLEGE', 'INSTITUTE') NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    established_year INT,
    website VARCHAR(255),
    logo VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_college_name (name),
    INDEX idx_college_code (code),
    INDEX idx_college_city (city),
    INDEX idx_college_state (state),
    INDEX idx_college_type (type)
);

-- Event categories table
CREATE TABLE event_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(20),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_category_name (name)
);

-- Insert default categories
INSERT INTO event_categories (name, description, color, icon) VALUES
('Technical', 'Technical events and competitions', '#3B82F6', 'laptop'),
('Cultural', 'Cultural festivals and performances', '#EC4899', 'music'),
('Sports', 'Sports tournaments and matches', '#10B981', 'trophy'),
('Workshop', 'Hands-on workshops and training', '#6366F1', 'wrench'),
('Seminar', 'Educational seminars and talks', '#F59E0B', 'presentation'),
('Hackathon', 'Programming competitions', '#8B5CF6', 'code'),
('Fest', 'College festivals and celebrations', '#EF4444', 'calendar'),
('Placement', 'Career and placement events', '#14B8A6', 'briefcase'),
('Competition', 'Various competitions', '#64748B', 'award');

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    college_id BIGINT,
    role_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_user_email (email),
    INDEX idx_user_college (college_id),
    INDEX idx_user_role (role_id),
    INDEX idx_user_active (is_active)
);

-- User roles junction table (for future extensibility)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    college_id BIGINT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0.00,
    seats_total INT NOT NULL,
    seats_left INT NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED') DEFAULT 'DRAFT',
    is_featured BOOLEAN DEFAULT FALSE,
    is_partner_event BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES event_categories(id),
    FOREIGN KEY (organizer_id) REFERENCES users(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    INDEX idx_event_title (title),
    INDEX idx_event_category (category_id),
    INDEX idx_event_college (college_id),
    INDEX idx_event_organizer (organizer_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_status (status),
    INDEX idx_event_featured (is_featured),
    INDEX idx_event_partner (is_partner_event),
    INDEX idx_event_deadline (deadline),
    INDEX idx_event_search (title, description) FULLTEXT
);

-- Event highlights table
CREATE TABLE event_highlights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    highlight_text VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_highlight_event (event_id),
    INDEX idx_highlight_order (order_index)
);

-- Bookings table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    qr_code VARCHAR(500),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED') DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_event (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_event (event_id),
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_booking_status (status),
    INDEX idx_booking_payment (payment_status)
);

-- Collaborations table
CREATE TABLE collaborations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_college_id BIGINT NOT NULL,
    partner_college_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'TERMINATED') DEFAULT 'PENDING',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP NULL,
    special_offers TEXT,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    INDEX idx_collaboration_requester (requester_college_id),
    INDEX idx_collaboration_partner (partner_college_id),
    INDEX idx_collaboration_status (status)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_at),
    INDEX idx_notification_type (type)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_action (action)
);

-- Create some sample colleges
INSERT INTO colleges (name, code, type, city, state, established_year) VALUES
('Mandsaur University', 'MU', 'UNIVERSITY', 'Mandsaur', 'Madhya Pradesh', 2015),
('IIT Indore', 'IITI', 'INSTITUTE', 'Indore', 'Madhya Pradesh', 2009),
('DAVV Indore', 'DAVV', 'UNIVERSITY', 'Indore', 'Madhya Pradesh', 1964),
('IIM Indore', 'IIMI', 'INSTITUTE', 'Indore', 'Madhya Pradesh', 1996),
('MITS Gwalior', 'MITS', 'COLLEGE', 'Gwalior', 'Madhya Pradesh', 1957),
('SGSITS Indore', 'SGSITS', 'COLLEGE', 'Indore', 'Madhya Pradesh', 1952),
('Medi-Caps University', 'MCU', 'UNIVERSITY', 'Indore', 'Madhya Pradesh', 2000);

-- Create a default super admin user
-- Password: Admin@123 (hashed with BCrypt)
INSERT INTO users (email, password_hash, first_name, last_name, role_id, college_id, is_active, email_verified) VALUES
('admin@university-events.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 5, 1, TRUE, TRUE);

-- Create performance indexes for common queries
CREATE INDEX idx_events_search_composite ON events(status, event_date, is_featured);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Create view for event statistics
CREATE VIEW event_statistics AS
SELECT 
    e.college_id,
    c.name as college_name,
    COUNT(e.id) as total_events,
    COUNT(CASE WHEN e.status = 'APPROVED' THEN 1 END) as approved_events,
    COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) as completed_events,
    SUM(e.seats_total) as total_seats,
    SUM(e.seats_left) as available_seats,
    AVG(e.fee) as average_fee
FROM events e
JOIN colleges c ON e.college_id = c.id
GROUP BY e.college_id, c.name;

-- Create view for user statistics
CREATE VIEW user_statistics AS
SELECT 
    r.name as role_name,
    COUNT(u.id) as total_users,
    COUNT(CASE WHEN u.email_verified = TRUE THEN 1 END) as verified_users,
    COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_users
FROM users u
JOIN roles r ON u.role_id = r.id
GROUP BY r.name;

-- Create stored procedure for updating event seats
DELIMITER //
CREATE PROCEDURE UpdateEventSeats(
    IN p_event_id BIGINT,
    IN p_seats_change INT
)
BEGIN
    DECLARE v_current_seats INT;
    DECLARE v_total_seats INT;
    
    -- Get current seats
    SELECT seats_left, seats_total INTO v_current_seats, v_total_seats
    FROM events
    WHERE id = p_event_id;
    
    -- Check if seats update is valid
    IF v_current_seats + p_seats_change >= 0 AND v_current_seats + p_seats_change <= v_total_seats THEN
        UPDATE events
        SET seats_left = seats_left + p_seats_change,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_event_id;
        
        SELECT ROW_COUNT() as affected_rows;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid seats update: seats would be negative or exceed total';
    END IF;
END //
DELIMITER ;

-- Create trigger for audit logging
DELIMITER //
CREATE TRIGGER audit_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (NEW.id, 'CREATE', 'USER', NEW.id, JSON_OBJECT(
        'email', NEW.email,
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'role_id', NEW.role_id,
        'college_id', NEW.college_id
    ));
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER audit_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'USER', NEW.id, 
        JSON_OBJECT(
            'email', OLD.email,
            'first_name', OLD.first_name,
            'last_name', OLD.last_name,
            'is_active', OLD.is_active
        ),
        JSON_OBJECT(
            'email', NEW.email,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'is_active', NEW.is_active
        )
    );
END //
DELIMITER ;

-- Create function to check event availability
DELIMITER //
CREATE FUNCTION IsEventAvailable(p_event_id BIGINT) 
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_available BOOLEAN DEFAULT FALSE;
    DECLARE v_status VARCHAR(20);
    DECLARE v_seats_left INT;
    DECLARE v_deadline DATE;
    
    SELECT status, seats_left, deadline INTO v_status, v_seats_left, v_deadline
    FROM events
    WHERE id = p_event_id;
    
    IF v_status = 'APPROVED' AND v_seats_left > 0 AND v_deadline >= CURDATE() THEN
        SET v_available = TRUE;
    END IF;
    
    RETURN v_available;
END //
DELIMITER ;

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON event_discovery_db.* TO 'event_app'@'localhost';
-- FLUSH PRIVILEGES;
