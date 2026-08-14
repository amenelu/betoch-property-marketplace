-- DEVELOPMENT DATA ONLY. Reset the database before production.
insert into public.locations(city,subcity,neighborhood) values ('Addis Ababa','Bole','Bole'),('Addis Ababa','Kirkos','Kazanchis'),('Addis Ababa','Yeka','CMC'),('Addis Ababa','Nifas Silk-Lafto','Saris'),('Addis Ababa','Yeka','Yeka'),('Addis Ababa','Nifas Silk-Lafto','Old Airport'),('Addis Ababa','Bole','Gerji'),('Addis Ababa','Kolfe Keranio','Jemo'),('Addis Ababa','Lemi Kura','Ayat') on conflict do nothing;
-- Auth-backed users are created through scripts/seed.ts so their IDs remain valid FK references.
