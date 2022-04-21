
CREATE TABLE projects(
	id SERIAL PRIMARY KEY,
  	title VARCHAR (50) NOT NULL,
  	language VARCHAR(50)[] NOT NULL,
  	summary VARCHAR(300) NOT NULL,
  	description VARCHAR,
  	image TEXT,
  	create_date DATE,
  	difficulty int
);