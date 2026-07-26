-- We Eat v1.2.0 Neon PostgreSQL schema
-- Generated from SQLAlchemy metadata. Run once in a clean Neon database.

CREATE TYPE user_role AS ENUM ('USER', 'MODERATOR', 'ADMIN');

CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

CREATE TYPE otp_purpose AS ENUM ('REGISTER', 'RESET_PASSWORD');

CREATE TYPE listing_type AS ENUM ('FREE', 'DISCOUNTED', 'EXCHANGE');

CREATE TYPE listing_status AS ENUM ('ACTIVE', 'RESERVED', 'COMPLETED', 'EXPIRED', 'REMOVED');

CREATE TYPE order_status AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'READY', 'COMPLETED', 'CANCELLED');

CREATE TYPE fulfillment_method AS ENUM ('PICKUP', 'DELIVERY');

CREATE TYPE exchange_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

CREATE TYPE report_target_type AS ENUM ('LISTING', 'USER', 'COMMENT');

CREATE TYPE report_status AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');


CREATE TABLE users (
	id UUID NOT NULL, 
	email VARCHAR(320) NOT NULL, 
	username VARCHAR(30) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	display_name VARCHAR(120) NOT NULL, 
	phone VARCHAR(30), 
	avatar_url VARCHAR(1000), 
	avatar_public_id VARCHAR(500), 
	bio VARCHAR(500), 
	city VARCHAR(100), 
	area VARCHAR(100), 
	role user_role NOT NULL, 
	status user_status NOT NULL, 
	token_version INTEGER NOT NULL, 
	email_verified_at TIMESTAMP WITH TIME ZONE, 
	last_login_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE UNIQUE INDEX ix_users_username ON users (username);


CREATE TABLE otp_codes (
	id UUID NOT NULL, 
	email VARCHAR(320) NOT NULL, 
	purpose otp_purpose NOT NULL, 
	code_hash VARCHAR(64) NOT NULL, 
	attempts INTEGER NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	consumed_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_otp_email_purpose_created ON otp_codes (email, purpose, created_at);


CREATE TABLE listings (
	id UUID NOT NULL, 
	owner_id UUID NOT NULL, 
	listing_type listing_type NOT NULL, 
	status listing_status NOT NULL, 
	title VARCHAR(160) NOT NULL, 
	description TEXT NOT NULL, 
	category VARCHAR(80) NOT NULL, 
	quantity INTEGER NOT NULL, 
	unit VARCHAR(40) NOT NULL, 
	original_price NUMERIC(12, 2), 
	discounted_price NUMERIC(12, 2), 
	exchange_for VARCHAR(300), 
	prepared_at TIMESTAMP WITH TIME ZONE, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	city VARCHAR(100) NOT NULL, 
	area VARCHAR(100) NOT NULL, 
	is_vegetarian BOOLEAN NOT NULL, 
	allergens VARCHAR(500), 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_listing_quantity_positive CHECK (quantity > 0), 
	CONSTRAINT ck_discounted_listing_price CHECK ((listing_type != 'DISCOUNTED') OR (discounted_price IS NOT NULL AND discounted_price >= 0)), 
	FOREIGN KEY(owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_listings_status ON listings (status);

CREATE INDEX ix_listings_category ON listings (category);

CREATE INDEX ix_listings_listing_type ON listings (listing_type);

CREATE INDEX ix_listings_expires_at ON listings (expires_at);

CREATE INDEX ix_listings_browse ON listings (status, listing_type, city, created_at);

CREATE INDEX ix_listings_owner_id ON listings (owner_id);

CREATE INDEX ix_listings_city ON listings (city);

CREATE INDEX ix_listings_area ON listings (area);


CREATE TABLE audit_logs (
	id UUID NOT NULL, 
	actor_id UUID, 
	action VARCHAR(120) NOT NULL, 
	target_type VARCHAR(80) NOT NULL, 
	target_id UUID, 
	metadata_json JSON, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(actor_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_audit_logs_action ON audit_logs (action);

CREATE INDEX ix_audit_target ON audit_logs (target_type, target_id);

CREATE INDEX ix_audit_logs_actor_id ON audit_logs (actor_id);


CREATE TABLE listing_images (
	id UUID NOT NULL, 
	listing_id UUID NOT NULL, 
	secure_url VARCHAR(1000) NOT NULL, 
	public_id VARCHAR(500) NOT NULL, 
	position INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_listing_image_position UNIQUE (listing_id, position), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
);

CREATE INDEX ix_listing_images_listing_id ON listing_images (listing_id);


CREATE TABLE listing_private_details (
	listing_id UUID NOT NULL, 
	pickup_address VARCHAR(500) NOT NULL, 
	contact_phone VARCHAR(30), 
	delivery_notes VARCHAR(500), 
	PRIMARY KEY (listing_id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
);


CREATE TABLE favorites (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	listing_id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_favorite_user_listing UNIQUE (user_id, listing_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
);

CREATE INDEX ix_favorites_user_id ON favorites (user_id);

CREATE INDEX ix_favorites_listing_id ON favorites (listing_id);


CREATE TABLE comments (
	id UUID NOT NULL, 
	listing_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	parent_comment_id UUID, 
	content VARCHAR(1200) NOT NULL, 
	is_deleted BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE INDEX ix_comments_listing_id ON comments (listing_id);

CREATE INDEX ix_comments_user_id ON comments (user_id);

CREATE INDEX ix_comments_parent_comment_id ON comments (parent_comment_id);


CREATE TABLE orders (
	id UUID NOT NULL, 
	listing_id UUID NOT NULL, 
	requester_id UUID NOT NULL, 
	provider_id UUID NOT NULL, 
	status order_status NOT NULL, 
	quantity INTEGER NOT NULL, 
	agreed_price NUMERIC(12, 2) NOT NULL, 
	fulfillment_method fulfillment_method NOT NULL, 
	message VARCHAR(500), 
	delivery_address VARCHAR(500), 
	requester_confirmed_at TIMESTAMP WITH TIME ZONE, 
	provider_confirmed_at TIMESTAMP WITH TIME ZONE, 
	accepted_at TIMESTAMP WITH TIME ZONE, 
	completed_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_order_quantity_positive CHECK (quantity > 0), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE RESTRICT, 
	FOREIGN KEY(requester_id) REFERENCES users (id) ON DELETE RESTRICT, 
	FOREIGN KEY(provider_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX ix_orders_provider_status ON orders (provider_id, status);

CREATE INDEX ix_orders_listing_id ON orders (listing_id);

CREATE INDEX ix_orders_requester_id ON orders (requester_id);

CREATE INDEX ix_orders_provider_id ON orders (provider_id);

CREATE INDEX ix_orders_requester_status ON orders (requester_id, status);


CREATE TABLE exchange_requests (
	id UUID NOT NULL, 
	listing_id UUID NOT NULL, 
	offered_listing_id UUID, 
	requester_id UUID NOT NULL, 
	provider_id UUID NOT NULL, 
	status exchange_status NOT NULL, 
	offered_description VARCHAR(500), 
	message VARCHAR(500), 
	requester_confirmed_at TIMESTAMP WITH TIME ZONE, 
	provider_confirmed_at TIMESTAMP WITH TIME ZONE, 
	accepted_at TIMESTAMP WITH TIME ZONE, 
	completed_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_exchange_offer_present CHECK (offered_listing_id IS NOT NULL OR offered_description IS NOT NULL), 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE RESTRICT, 
	FOREIGN KEY(offered_listing_id) REFERENCES listings (id) ON DELETE SET NULL, 
	FOREIGN KEY(requester_id) REFERENCES users (id) ON DELETE RESTRICT, 
	FOREIGN KEY(provider_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX ix_exchange_requester_status ON exchange_requests (requester_id, status);

CREATE INDEX ix_exchange_requests_offered_listing_id ON exchange_requests (offered_listing_id);

CREATE INDEX ix_exchange_requests_provider_id ON exchange_requests (provider_id);

CREATE INDEX ix_exchange_requests_requester_id ON exchange_requests (requester_id);

CREATE INDEX ix_exchange_requests_listing_id ON exchange_requests (listing_id);

CREATE INDEX ix_exchange_provider_status ON exchange_requests (provider_id, status);


CREATE TABLE reviews (
	id UUID NOT NULL, 
	reviewer_id UUID NOT NULL, 
	reviewee_id UUID NOT NULL, 
	order_id UUID, 
	exchange_request_id UUID, 
	rating INTEGER NOT NULL, 
	comment VARCHAR(1000), 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_review_rating CHECK (rating BETWEEN 1 AND 5), 
	CONSTRAINT ck_review_one_transaction CHECK ((order_id IS NOT NULL AND exchange_request_id IS NULL) OR (order_id IS NULL AND exchange_request_id IS NOT NULL)), 
	CONSTRAINT uq_review_order_reviewer UNIQUE (reviewer_id, order_id), 
	CONSTRAINT uq_review_exchange_reviewer UNIQUE (reviewer_id, exchange_request_id), 
	FOREIGN KEY(reviewer_id) REFERENCES users (id) ON DELETE RESTRICT, 
	FOREIGN KEY(reviewee_id) REFERENCES users (id) ON DELETE RESTRICT, 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(exchange_request_id) REFERENCES exchange_requests (id) ON DELETE CASCADE
);

CREATE INDEX ix_reviews_reviewee_id ON reviews (reviewee_id);

CREATE INDEX ix_reviews_exchange_request_id ON reviews (exchange_request_id);

CREATE INDEX ix_reviews_reviewer_id ON reviews (reviewer_id);

CREATE INDEX ix_reviews_order_id ON reviews (order_id);


CREATE TABLE reports (
	id UUID NOT NULL, 
	reporter_id UUID NOT NULL, 
	target_type report_target_type NOT NULL, 
	listing_id UUID, 
	user_id UUID, 
	comment_id UUID, 
	reason VARCHAR(120) NOT NULL, 
	details VARCHAR(1000), 
	status report_status NOT NULL, 
	resolution_note VARCHAR(1000), 
	handled_by_id UUID, 
	handled_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_report_target CHECK ((target_type = 'LISTING' AND listing_id IS NOT NULL AND user_id IS NULL AND comment_id IS NULL) OR (target_type = 'USER' AND user_id IS NOT NULL AND listing_id IS NULL AND comment_id IS NULL) OR (target_type = 'COMMENT' AND comment_id IS NOT NULL AND listing_id IS NULL AND user_id IS NULL)), 
	FOREIGN KEY(reporter_id) REFERENCES users (id) ON DELETE RESTRICT, 
	FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(comment_id) REFERENCES comments (id) ON DELETE CASCADE, 
	FOREIGN KEY(handled_by_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_reports_status_created ON reports (status, created_at);

CREATE INDEX ix_reports_reporter_id ON reports (reporter_id);
