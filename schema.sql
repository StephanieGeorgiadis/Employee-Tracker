DROP DATABASE IF EXISTS business_db;

CREATE DATABASE business_db;

USE business_db;

CREATE TABLE departments (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    PRIMARY KEY(id)
);

-- Join to display all employee information.
SELECT *
FROM employees
    RIGHT JOIN roles ON employees.role_id = roles.id
	RIGHT JOIN departments ON roles.department_id = departments.id
ORDER BY departments.name;

SELECT 
	employees.id, 
    employees.first_name, 
    employees.last_name, 
    employees.manager_id, 
    roles.title, 
    roles.id AS role_id,
    roles.salary, 
    departments.name
FROM employees
    INNER JOIN roles ON employees.role_id = roles.id
	INNER JOIN departments ON roles.department_id = departments.id
WHERE departments.name = 'Engineering';

-- Selecting from the tables.
SELECT * 
FROM departments;
SELECT *
FROM roles;
SELECT *
FROM employees;