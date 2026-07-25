CREATE TABLE users(id SERIAL PRIMARY KEY,email TEXT UNIQUE,username TEXT UNIQUE,password_hash TEXT,role TEXT DEFAULT 'USER');
CREATE TABLE listings(id SERIAL PRIMARY KEY,title TEXT,listing_type TEXT,original_price NUMERIC,payable_price NUMERIC);
