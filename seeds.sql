INSERT INTO departments (name) VALUE
    ("Sales"),
    ("Engineering"),
    ("Legal"),
    ("Finance");

INSERT INTO roles (title, salary, department_id) VALUE
    ("Sales Lead", 75000, 1),
    ("Salesperson", 55000, 1),
    ("Lead Engineer", 94000, 2),
    ("Software Engineer", 73000, 2),
    ("Hardware Engineer", 79000, 2),
    ("Legal Team Lead", 95000, 3),
    ("Lawyer", 80000, 3),
    ("Accountant", 65000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE
    ("Jane", "Smith", 1, null),
    ("Nancy", "Carter", 2, 1),
    ("Saoirse", "Ronan", 2, 1),
    ("Stephanie", "Georgiadis", 3, null),
    ("Hanns", "Zimmer", 4, 4),
    ("Sally", "Peterson", 4, 4),
    ("Taylor", "Swift", 5, 4),
    ("Michael", "Jordan", 6, null),
    ("Katherine", "Winnick", 7, 8),
    ("Drew", "Carrey", 7, 8),
    ("Lucy", "Leiu", 8, null);