//========================================================================== 
// Dependencies
//==========================================================================

var mysql = require("mysql");
var inquirer = require("inquirer");

// Event listener to increase default from 10 to 15.
require('events').EventEmitter.defaultMaxListeners = 15;

//========================================================================== 
// Database Connection Area
//==========================================================================

// Handling connection infor for the database.
var connection = mysql.createConnection({ 
    host: "localhost",
    port: 3306,               // Your port; if not 3306
    user: "root",             // Your username
    password: "Fab3rrittana",  // Your password
    database: "business_db"   // Database name
});

// Connecting to database.
connection.connect(function(err) { 
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    mainMenu();
});

//========================================================================== 
// Functions Area
//==========================================================================

// Function for main menu options
function mainMenu() {
    connection.query("SELECT * FROM employees", function(err, result) {
        if (err) throw err;
        mainInq();
    });
};

// Function to view department, role or employee.
function vDeparment() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "View",
                choices: ["Departments", "Roles", "Employees", "Back"],
                name: "view"
            }
        ]).then(function(response) {
            switch (response.view.toLowerCase()) {
                case "departments":
                    connectQ("SELECT * FROM departments", back, vDeparment);
                    break;
                case "roles":
                    connectQ("SELECT * FROM roles", back, vDeparment);
                    break;
                case "employees":
                    connectQ("SELECT * FROM employees INNER JOIN roles ON employees.role_id = roles.id", back, vDeparment);
                    break;
                default:
                    mainInq();
            }
        });
};

// Function to view employees by manager.
function vManagement() {
    connection.query("SELECT title FROM roles", function(err, result) {
        if (err) throw err;
        let roles = ["Back"];
        result.forEach(element => {
            if (element.title.includes("Lead")) {
                roles.unshift(element.title);
            }
        });
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "View",
                    choices: roles,
                    name: "role"
                }
            ]).then(function(response) {
                if (response.role === "Back") {
                    return mainInq();
                }
                connection.query(
                    joined + "WHERE departments.name = ?", [response.role], function(err, result) { 
                        if (err) throw err;
                        console.table(result);
                        back(vManagement);
                    }
                );
            });
    });    
};

// Function to view the budget of departments or business as whole.
function budget() {
    connection.query("SELECT name FROM departments", function(err, result) {
        if (err) throw err;
        let departments = ["Total", "Back"];
        result.forEach(element => departments.unshift(element.name));
        
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "View",
                    choices: departments,
                    name: "budget"
                }
            ]).then(function(response) {
                if (response.budget==="Back") {
                    return mainInq();
                } else if (response.budget==="Total") {
                    let where = "";
                    return budgetQuery(where);
                }
                let what = response.budget;
                let where = "WHERE ?";
                return budgetQuery(where, what)
            });
    });
    
};

// Connection query for the budget().
function budgetQuery(where, what) {
    connection.query(joined + where, [{name:what}], function(err, result) {
        if (err) throw err;
        console.table(result);
        let total = 0;
        result.forEach(element => {total += parseInt(element.salary)})
        console.log("Total expenditure: $" + total + " per year.");
        back(budget);
    });
};

// Function to update employee role.
function upEmployee() {
    let options = [];
    let managers = ["null | No Current manager"];
    let roles = [];

    connection.query(joined, function(err, result) {       
        result.forEach(element => {
            if (!roles.includes(element.role_id + " " + element.title)&&!element.title.includes("Lead")) {
                roles.push(element.role_id + " " + element.title)
            }
            if (element.title.includes("Lead")) {
                managers.push(element.id + " |" + element.title + " |" + element.first_name + " |" + element.last_name);
            }
            options.push(element.first_name + " " + element.last_name);
        });
    
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which employee do you want to update?",
                    choices: options,
                    name: "employee"
                }
            ]).then(function(response) {
                updateEmp(response, roles, managers);
            });
    });
};

// Function to update employee managers.
function upManager() {
    connection.query(rightJ, function(err, result) {
        if (err) throw err;
        let options = [];
        let promote = [];
        result.forEach(element => {
            if (!element.title.includes("Lead")&&element.id !== null) {
                options.push(element.id + " " + element.first_name + " " + element.last_name + " | Current role_id/title: " + element.role_id + "/" + element.title + " | Manager Id: " + element.manager_id + " | Department: " + element.name);
            }
            if (element.title.includes("Lead")) {
                promote.push(element.role_id + " | " + element.title);
            }
        });
        promoteEmp(options, promote);
    });   
};

// Function to add department, role, employee.
function aDepartment() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to add?",
                choices: ["Department", "Role", "Employee", "Back"],
                name: "add_column"
            }
        ]).then(function(response) {
            connection.query(rightJ, function(err, result) {
                if (err) throw err;
                switch (response.add_column.toLowerCase()) {
                    case "department":
                        newDep();
                        break;
                    case "role":
                        newRole(result);
                        break;
                    case "employee":
                        newEmp(result);
                        break;
                    default:
                        mainInq();
                }
            });  
        });
};

// Function to delete department, role or employee.
function dInfo() {
    inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to remove?",
            choices: ["Department", "Role", "Employee", "Back"],
            name: "remove_column"
        }
    ]).then(function(response) {
        connection.query(rightJ, function(err, result) {
            if (err) throw err;
            switch (response.remove_column.toLowerCase()) {
                case "department":
                    removeDep(result);
                    break;
                case "role":
                    removeRole(result);
                    break;
                case "employee":
                    removeEmp(result);
                    break;
                default:
                    mainInq();
            }
        });  
    });
};

//========================================================================== 
// Extra Inquirer Functions
//==========================================================================

// Inquirer for mainMenu()
function mainInq() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: 
                    [
                        "View business areas", 
                        "View employees by manger", 
                        "View budget", 
                        "Update an employee", 
                        "Update a manager", 
                        "Add department, role or employee", 
                        "Delete department, role or employee",
                        "Exit"
                    ],
                name: "user_action"
            }
        ]).then(function(response) {
            // Switch case for options.
            switch (response.user_action) {
                case "View business areas":
                    vDeparment();
                    break;
                case "View employees by manger":
                    vManagement();
                    break;
                case "View budget":
                    budget();
                    break;
                case "Update an employee":
                    upEmployee();
                    break;
                case "Update a manager":
                    upManager();
                    break;
                case "Add department, role or employee":
                    aDepartment();
                    break;
                case "Delete department, role or employee":
                    dInfo();
                    break;
                default:
                    connection.end();
            }
        });
};

// Follow up inquirer for upEmployee().
function updateEmp(response, roles, managers) {
    let worker = response.employee.split(" "); 
    inquirer
        .prompt([
            {
                type: "list",
                message: "What role are they going to fill?",
                choices: roles,
                name: "role"
            },
            {
                type: "list",
                message: "Who is their manager?",
                choices: managers,
                name: "manager"
            }
        ]).then(function(response) {
            let role = response.role.split(" ");
            let manager_id = response.manager.split(" ");
            if (response.manager.includes("null")) {
                manager_id = [null];
            }
            connection.query("UPDATE employees SET ? WHERE ? AND ?", 
            [
                {
                    role_id: role[0],
                    manager_id: manager_id[0]
                },
                {
                    first_name:worker[0]
                }, 
                {
                    last_name:worker[1]
                }
            ], 
            function(err, result) {
                if (err) throw err;
                console.log(worker.join(" ") + " has had their information been updated successfully");
                mainMenu();
            });
        });
};

// Function for update managers
function promoteEmp(options, promote) {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Who do you want to promote?",
                choices: options,
                name: "employee"
            },
            {
                type: "list",
                message: "What position are they filling?",
                choices: promote,
                name: "promotion"
            }
        ]).then(function(response) { 
            let worker = response.employee.split(" ");
            let manager = response.employee.split("| Manager Id: ").pop().split("| Department: ").shift();
            let oldjob = response.employee.split("| Current role_id/title: ").pop().split("| Manager Id: ").shift(); 
            let promotion = response.promotion.split(" | ");

            // Swap lead role and assign old manager a manager_id.
            connection.query("UPDATE employees INNER JOIN roles ON employees.role_id = roles.id SET ? WHERE title = ?", 
            [
                {
                    role_id:oldjob[0], 
                    manager_id:manager
                }, 
                promotion[1]
            ], 
            function(err, result) {
                if (err) throw err;
                console.log(result);
            });
            
            // Aet new role.
            connection.query("UPDATE employees SET manager_id = null, ? WHERE ? AND ?", 
            [
                {
                    role_id:promotion[0], 
                }, 
                {
                    first_name:worker[1]
                }, 
                {
                    last_name:worker[2]
                }
            ], 
            function(err, result) {
                if (err) throw err;
                console.log(result);
            });

            // Assign everyone the new managers ids.
            connection.query(
                "UPDATE employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id SET manager_id = ? WHERE role_id = ?", [worker[0], oldjob[0]], function(err, result) {
                if (err) throw err;
                console.log(result);
            });
            mainMenu();
        });
};

// Function for new department.
function newDep() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the new departments name?",
                name: "newDep",
                validate: async newDep => {
                    if (newDep.match(/^[A-Za-z\s]+$/)) {
                        return true;
                    }
                    return console.log("Department name can only contain letters");
                }
            }
        ]).then(function(response) {
            connection.query("INSERT INTO departments SET ?", [{name:response.newDep}], function(err, result) {
                if (err) throw err;
                console.log(response.newDep + " has been added to the business!");
                back(aDepartment);
            });
        });
};

// Function for new role.
function newRole(result) {
    let departments = [];
    result.forEach(element => {
        if (!departments.includes(element.dep_id + " " + element.name)) {
            departments.push(element.dep_id + " " + element.name)
        }
    });
    console.log(departments);

    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the new roles title?",
                name: "title",
                validate: async title => {
                    if (title.match(/^[A-Za-z\s]+$/)) {
                        return true;
                    }
                    return console.log("Title can only contain letters");
                }
            },
            {
                type: "input",
                message: "What is the new roles salary?",
                name: "salary",
                val: async name => {
                    if (name.match(/^[0-9]+$/)) {
                        return true;
                    }
                    return console.log("Please enter a valid number");
                }
            },
            {
                type: "list",
                message: "What is the new roles department id?",
                choices: departments,
                name: "id"
            }
        ]).then(function(response) {
            let id = response.id.split(" ");
            connection.query("INSERT INTO roles SET ?", 
            [{
                title:response.title, 
                salary:response.salary, 
                department_id:id[0]
            }], 
            function(err, result) {
                if (err) throw err;
                console.log(response.title + " has been added to " + id[1] + "!");
                back(aDepartment);
            });
        });
};

// Function for new employee.
function newEmp(result) {
    let managers = ["null | No Current manager"];
    let roles = [];
    result.forEach(element => {
        if (!roles.includes(element.role_id + " " + element.title)) {
            roles.push(element.role_id + " " + element.title)
        }
        if (element.first_name) {
            if (element.title.includes("Lead")) {
                managers.push(element.id + " |" + element.title + " |" + element.first_name + " |" + element.last_name);
            }
        }
    });

    inquirer
        .prompt([
            {
                type: "input",
                message: "What is their first name?",
                name: "first",
                validate: async first => {
                    if (first.match(/^[A-Za-z\s]+$/)) {
                        return true;
                    }
                    return console.log("Please enter a valid name");
                }
            },
            {
                type: "input",
                message: "What is their last name?",
                name: "last",
                validate: async last => {
                    if (last.match(/^[A-Za-z\s]+$/)) {
                        return true;
                    }
                    return console.log("Please enter a valid name");
                }
            },
            {
                type: "list",
                message: "What is their new role id?", 
                choices: roles,
                name: "role"
            },
            {
                type: "list",
                message: "What is their managers id?",
                choices: managers,
                name: "manager"
            }
        ]).then(function(response) {
            let role = response.role.split(" ");
            let manager_id = response.manager.split(" ");
            if (response.manager.includes("null")) {
                manager_id = [null];
            }
            connection.query("INSERT INTO employees SET ?", 
            [{
                first_name:response.first, 
                last_name:response.last, 
                role_id:role[0], 
                manager_id:manager_id[0]
            }], 
            function(err, result) {
                if (err) throw err;
                console.log(response.first + " " + response.last + " has been added to the " + role[1] + "!");
                back(aDepartment);
            });
        });
};

// Function to remove department.
function removeDep(result) {
    let departments = [];
    result.forEach(element => {
        if (!departments.includes(element.dep_id + " " + element.name)) {
            departments.push(element.dep_id + " " + element.name)
        }
    });
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which department would you like to delete?",
                choices: departments,
                name: "item"
            }
        ]).then(function(response) {
        connection.query("DELETE FROM departments WHERE name = ?", [response.item], function(err, result) {
            if (err) throw err;
            console.log(response.item + " has been deleted sucessfully");
            mainMenu();
        });
    });
};

// Function to remove role.
function removeRole(result) {
    let roles = [];
    result.forEach(element => {
        if (!roles.includes(element.title)) {
            roles.push(element.title)
        }
    });
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which role would you like to delete?",
                choices: roles,
                name: "item"
            }
        ]).then(function(response) {
        connection.query("DELETE FROM roles WHERE title = ?", [response.item], function(err, result) {
            if (err) throw err;
            console.log(response.item + " has been deleted sucessfully");
            mainMenu();
        });
    });
};

// Function to remove employee.
function removeEmp(result) {
    let options = [];
    result.forEach(element => {
        options.push(element.first_name + " " + element.last_name);
    });
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which employee would you like to delete?",
                choices: options,
                name: "item"
            }
        ]).then(function(response) {
        let worker = response.item.split(" ");
        connection.query("DELETE FROM employees WHERE first_name = ? AND last_name = ?", [worker[0], worker[1]], function(err, result) {
            if (err) throw err;
            console.log(response.item + " has been deleted sucessfully");
            mainMenu();
        });
    });
};

// Inquirer to return to a previous menu.
function back(whereto) {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Back",
                choices: ["Back"],
                name: "back"
            }
        ]).then(function(response) {
            whereto();
        });
};

//========================================================================== 
// Query function & strings
//==========================================================================

// Connection query vDepartments().
function connectQ(query, func, menu) {
    connection.query(query, function(err, result) {
        if (err) throw err;
        console.table(result);
        func(menu);
    });
}

// Query for showing all filled positions.
const joined = "SELECT employees.id, employees.first_name, employees.last_name, employees.manager_id, roles.title, roles.id AS role_id, roles.salary, departments.id AS dep_id, departments.name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ";

// Query to show all employees plus roles or departments that still need employees assigned.
const rightJ = "SELECT employees.id, employees.first_name, employees.last_name, employees.manager_id, roles.title, roles.id AS role_id, roles.salary, departments.id AS dep_id, departments.name FROM employees RIGHT JOIN roles ON employees.role_id = roles.id RIGHT JOIN departments ON roles.department_id = departments.id ";