create table images (
	id int not null auto_increment,
	location_id int not null,
    anime_image text,
    real_image text,
    PRIMARY KEY (id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
)