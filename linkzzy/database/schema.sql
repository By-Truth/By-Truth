-- Linkzzy database schema (MySQL 5.7+ / MariaDB 10.3+)
-- Usage: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS linkzzy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE linkzzy;

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(30)  NOT NULL,
    email         VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(60)  NOT NULL DEFAULT '',
    bio           VARCHAR(160) NOT NULL DEFAULT '',
    avatar        VARCHAR(255) NULL,
    theme         VARCHAR(30)  NOT NULL DEFAULT 'minimal',
    plan          ENUM('free','pro') NOT NULL DEFAULT 'free',
    pro_until     DATETIME NULL,
    is_admin      TINYINT(1) NOT NULL DEFAULT 0,
    is_suspended  TINYINT(1) NOT NULL DEFAULT 0,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_username (username),
    UNIQUE KEY uniq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS links (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    title      VARCHAR(100) NOT NULL,
    url        VARCHAR(2048) NOT NULL,
    position   INT NOT NULL DEFAULT 0,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_position (user_id, position),
    CONSTRAINT fk_links_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_views (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    referrer   VARCHAR(190) NULL,
    device     ENUM('mobile','desktop') NOT NULL DEFAULT 'desktop',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_created (user_id, created_at),
    CONSTRAINT fk_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS link_clicks (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    link_id    INT UNSIGNED NOT NULL,
    user_id    INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_created (user_id, created_at),
    KEY idx_link (link_id),
    CONSTRAINT fk_clicks_link FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
    CONSTRAINT fk_clicks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    reference  VARCHAR(100) NOT NULL,
    amount     INT UNSIGNED NOT NULL COMMENT 'In the smallest currency unit (kobo for NGN)',
    currency   CHAR(3) NOT NULL DEFAULT 'NGN',
    status     ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at    DATETIME NULL,
    UNIQUE KEY uniq_reference (reference),
    KEY idx_user (user_id),
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
