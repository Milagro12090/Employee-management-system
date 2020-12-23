//Require inquirer
const inquirer = require('inquirer');

//connection to all .lib objects referenced
const connection = require("./lib/SQL_login");
const commandMenu = require('./lib/commandMenu');
const questions = require('./lib/questions');

//const for requiring the Sql quieries and the inquirer functions
const InquirerFunctions = require('./lib/inquirer');
const SQLquery = require('./lib/SQL_queries');

//const for inquirer types
const inquirerTypes = [
    'input', 'confirm', 'list'
]
//begin main app and start of menu
mainMenu();

function mainMenu() {

    //calling the inquirer functions to display the first main menu prompt
    const menuPrompt = new InquirerFunctions(inquirerTypes[2], 'menuChoice', questions.mainMenuPrompt, commandMenu);
    
    inquirer
   //beginig of inquirer prompt for choosing what function to use based on user choice
        .prompt([menuPrompt.ask()]).then(operation => {

            //const for a sql query to grab all data from roles
            const query1 = "SELECT role.title FROM role"
            const compRolesArrayQuery = new SQLquery(query1);

            //consts for another sql query to grab each department from the department DB
            const depNameQuery = "SELECT department.name FROM department";
            const depNamesArrayQuery = new SQLquery(depNameQuery);

            switch (operation.menuChoice) {

                case commandMenu[2]:
                    //case to view all employes -return viewAllEmp-
                    return viewAllEmp();

                case commandMenu[3]:
                    //case for vieing all employees in a given department
                    //queryReturnResult() is a method that will run a query to my sql and return it to the function as a pararmeter
                    depNamesArrayQuery.queryReturnResult(viewAllEmpDep);
                    break;

                case commandMenu[4]:
                    //case for viewing all employees by a given manger
                    const actionChoice5 = "VIEW BY MANAGER"
                    dummyArr = [];

                    EmpInfoPrompts(dummyArr, actionChoice5);
                    break;

                case commandMenu[5]:
                //case for viewing all employees by role
                    compRolesArrayQuery.getQueryNoRepeats(viewAllEmpRole)
                    break;

                case commandMenu[6]:
                    //case for vieing all managers and theyre departments -return viewAllManager
                    return viewAllManager();

                case commandMenu[11]:
                    //case for adding an employee
                    const actionChoice1 = "ADD"
                    compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice1);

                    break;

                case commandMenu[12]:
                    //case for deleting that employee
                    const actionChoice2 = "DELETE"
                    compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice2);
                    break;

                case commandMenu[13]:
                    //case to update employees role
                    const actionChoice3 = "UPDATE EMP ROLE"
                    compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice3);

                    break;

                case commandMenu[14]:
                    //case to change a manager for an employee
                    const actionChoice4 = "UPDATE EMP MANAGER";
                    compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice4);
                    break;

                case commandMenu[1]:
                    //case to view all roles in the company plus salaray
                    return viewAllRoles();

                case commandMenu[9]:
                    //case to add a role to the database
                    return addRole();

                case commandMenu[10]:
                    //case to remove that role from the database
                    const actionChoice7 = "DELETE ROLE";
                    compRolesArrayQuery.getQueryNoRepeats(deleteRole, actionChoice7);
                    break;
             
                case commandMenu[0]:
                    //case for viewing all departments
                    return viewAllDep();

                case commandMenu[7]:
                    //case to add a department
                    depNamesArrayQuery.queryReturnResult(addDep);
                    break;

                case commandMenu[8]:
                    //case to delete that appartment
                    depNamesArrayQuery.queryReturnResult(removeDep);
                    break;
            }
        })
}

//View all employees function
function viewAllEmp() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name
                     FROM employee
                     INNER JOIN role on role.id = employee.role_id
                     INNER JOIN department on department.id = role.department_id;`

    const empTable = new SQLquery(query);
   //this runs the SQL query declared by the Emp table variable, main menu is declared to bring the user to the next step
    empTable.generalTableQuery(mainMenu);
}

//function for viewing all employees by department
function viewAllEmpDep(depNamesArray) {
    
    
    const departmentNamePrompt = new InquirerFunctions(inquirerTypes[2], 'department_Name', questions.viewAllEmpByDep, depNamesArray);
    
   //this next prompt runs the next part of inquirer based on the above user input
    inquirer.prompt(departmentNamePrompt.ask()).then(userResp => {

        const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name
                        FROM employee
                        INNER JOIN role on role.id = employee.role_id
                        INNER JOIN department on department.id = role.department_id AND department.name = ? ;`

        const empByDepTable = new SQLquery(query, userResp.department_Name);
        //generates a table to console
        empByDepTable.generalTableQuery(mainMenu);
    })
}

//function to console a table of employees for managers 
//manager obj and names arr are delivered as parameters
function viewAllEmpManager(managerObj, namesArr) {
    

    const chosenManager = new InquirerFunctions(inquirerTypes[2], 'manager_choice', questions.searchByManager, namesArr);

    inquirer.prompt([chosenManager.ask()]).then(userChoice => {

        console.log(`Manager Searched By: ${userChoice.manager_choice}`);

        let chosenManagerID = 0;
        //grabs the managers name
        const chosenManagerName = userChoice.manager_choice.split(" ", 2)
        for (manager of managerObj) {
            if (chosenManagerName[1] == manager.lastName) {
                chosenManagerID = manager.ID;
            }
        }
        const queryManagerSearch = `SELECT employee.last_name, employee.first_name, role.title, department.name
                                    FROM employee
                                    INNER JOIN role on role.id = employee.role_id
                                    INNER JOIN department on department.id = role.department_id
                                    WHERE employee.manager_id = (?) `

        //creating a sql query instance for manager search
        const managerSearch = new SQLquery(queryManagerSearch, chosenManagerID);
        managerSearch.generalTableQuery(mainMenu);
    })
}
//begin function to view all employees by role
function viewAllEmpRole(compRoles, actionChoice) {

    //inquirer functions being sent to prompt
    const rolePrompt = new InquirerFunctions(inquirerTypes[2], 'role_Title', questions.viewAllEmpByRole, compRoles);
    inquirer.prompt(rolePrompt.ask()).then(userResp => {

        //selecting all collumns then filtering with (?) for user input
        const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name
                        FROM employee 
                        INNER JOIN role on role.id = employee.role_id AND role.title = (?)
                        INNER JOIN department on department.id = role.department_id;`;

        const empByRoleTable = new SQLquery(query, userResp.role_Title);
        empByRoleTable.generalTableQuery(mainMenu);
    })
}

function viewAllManager() {

   //const for returning selected results that have an employee id that is in the employee manager table
    const query = `SELECT employee.id, employee.first_name, employee.last_name, department.name
                    FROM employee
                    INNER JOIN role on role.id = employee.role_id
                    INNER JOIN department on department.id = role.department_id
                    WHERE employee.id IN ( SELECT employee.manager_id FROM employee );`;

    const managerTable = new SQLquery(query);
    managerTable.generalTableQuery(mainMenu);
}

//function that either adds or deletes employees based on user input
function EmpInfoPrompts(compRoles, actionChoice) {

    //query to select all employees from tables
    const query = "SELECT id, first_name, last_name FROM employee WHERE employee.id IN ( SELECT employee.manager_id FROM employee )";

    connection.query(query, function (err, res) {
        if (err) throw err
        
        let managerNamesArr = [];
        let managerObjArr = [];

        //for loop for manager names
        for (let i = 0; i < res.length; i++) {
            let name = res[i].first_name + " " + res[i].last_name;
            let managersobj = {
                ID: res[i].id,
                firstName: res[i].first_name,
                lastName: res[i].last_name
            }

            managerObjArr.push(managersobj);
            managerNamesArr.push(name);
        }

        //consts for inquirer functions for first, last, role, and manager
        const first_name = new InquirerFunctions(inquirerTypes[0], 'first_name', questions.addEmployee1);
        const last_name = new InquirerFunctions(inquirerTypes[0], 'last_name', questions.addEmployee2);
        const emp_role = new InquirerFunctions(inquirerTypes[2], 'employee_role', questions.addEmployee3, compRoles);
        const emp_manager = new InquirerFunctions(inquirerTypes[2], 'employee_manager', questions.addEmployee4, managerNamesArr);

      //action choice with add for adding employees
        if (actionChoice == "ADD") {

           //promise all to grab all instances of the inquirer functions above
            Promise.all([first_name.ask(), last_name.ask(), emp_role.ask(), emp_manager.ask()]).then(prompts => {
                inquirer.prompt(prompts).then(emp_info => {

                    //addEMP with manager object array
                    addEmp(emp_info, managerObjArr);
                })
            })
            //else if to handle if view by manager was chosen
        } else if (actionChoice == "VIEW BY MANAGER") {
            viewAllEmpManager(managerObjArr, managerNamesArr);

        } else {
            //promise.all for instances of inquirer to resolve
            Promise.all([first_name.ask(), last_name.ask()]).then(prompts => {
                inquirer.prompt(prompts).then(emp_info => {

                    //else if to deliver different parameters based on user input
                    if (actionChoice == "UPDATE EMP ROLE") {
                        EmpMultiplesCheck(emp_info, actionChoice, compRoles);
                    } else if (actionChoice == "UPDATE EMP MANAGER") {
                        EmpMultiplesCheck(emp_info, actionChoice, managerObjArr, managerNamesArr);
                    } else {
                        EmpMultiplesCheck(emp_info, actionChoice);
                    }
                })
            })
        }
    })
}

//function to add employee to data base
function addEmp(emp_info, managerObjArr) {

    console.log("You've entered employee ADD");


    const queryRoleIdFromTitle = "SELECT role.id FROM role WHERE role.title = (?) ;"
    connection.query(queryRoleIdFromTitle, emp_info.employee_role, function (err, res) {
        if (err) {
            throw err;
        }
        //const info for name, etc..
        const empRoleId = res[0].id;
        const empFirstName = emp_info.first_name;
        const empLastName = emp_info.last_name;
        const empManagerName = emp_info.employee_manager.split(" ");
        const empManagerFirstName = empManagerName[0];
        const empManagerLastName = empManagerName[1];

        let empManagerID = 0;
        //to add manager id to employee db
        for (let manager of managerObjArr) {
            if (manager.firstName == empManagerFirstName && manager.lastName === empManagerLastName) {
                empManagerID = manager.ID;
            }
        }
        //query insert
        const queryInsertEmpInfo = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)"
        connection.query(queryInsertEmpInfo, [empFirstName, empLastName, empRoleId, empManagerID], function (err, res) {
            if (err) {
                throw err
            }
            console.log("Employee Added");
            mainMenu();
        })
    })
}

//function for to check if multiple employees were added
function EmpMultiplesCheck(emp_info, actionChoice, arrayNeededForNextStep) {

    console.log("You've entered employee multiples check")

    const empFirstName = emp_info.first_name;
    const empLastName = emp_info.last_name;
    const queryMultipleEmpCheck = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, 
                                    employee.manager_id, department.name
                                    FROM employee 
                                    INNER JOIN role on role.id = employee.role_id
                                    INNER JOIN department on department.id = role.department_id
                                    WHERE employee.first_name = (?) AND employee.last_name = (?);`

    connection.query(queryMultipleEmpCheck, [empFirstName, empLastName], function (err, res) {

        //if more than one employee add was found 
        if (res.length > 1) {
            console.log("Multiple Employees Found!")
            let multipleName = [];
            for (employee of res) {
                let empStr = `${employee.id} ${employee.first_name} ${employee.last_name} ${employee.title} ${employee.name}`
                multipleName.push(empStr);
            }
            const which_employee_to_Delete = new InquirerFunctions(inquirerTypes[2], 'employee_delete', questions.deleteEmployee1, multipleName);

            inquirer.prompt([which_employee_to_Delete.ask()]).then(userChoice => {
                const chosenEmpInfo = userChoice.employee_delete.split(" ");
                const chosenEmpFirstName = chosenEmpInfo[1];
                const chosenEmpLastName = chosenEmpInfo[2];
                const chosenEmpID = chosenEmpInfo[0];
                const chosenEmpRole = chosenEmpInfo[3];

                if (actionChoice === "DELETE") {
                    deleteEmp(chosenEmpFirstName, chosenEmpLastName, chosenEmpID);
                } else if (actionChoice === "UPDATE EMP ROLE") {
                    updateEmpRole(chosenEmpID, arrayNeededForNextStep);
                } else if (actionChoice === "UPDATE EMP MANAGER") {
                    updateEmpManager(chosenEmpID, arrayNeededForNextStep);
                }
            })
            //else if reroute to main
        } else if (res[0].id == "undefined") {
            console.log("Could not find employee. Rerouted to Main Menu")
            mainMenu();
            //else for just one employee found
        } else {
            console.log("One Employee Found!")

            if (actionChoice === "DELETE") {
                deleteEmp(empFirstName, empLastName, res[0].id)
            } else if (actionChoice === "UPDATE EMP ROLE") {
                updateEmpRole(res[0].id, arrayNeededForNextStep);
            } else if (actionChoice === "UPDATE EMP MANAGER") {
                updateEmpManager(res[0].id, arrayNeededForNextStep);
            }
        }
    })
}   

//function to delete employee (first, last and id as pararameters)
function deleteEmp(firstName, lastName, employeeID) {
    console.log("You've entered employee delete.")

    const queryDelete = "DELETE FROM employee WHERE employee.id = (?);"
    const confirmDelete = new InquirerFunctions(inquirerTypes[2], 'confirm_choice', questions.deleteEmployee2 + firstName + " " + lastName + "?", ["yes", "no"]);
    const deleteQuery = new SQLquery(queryDelete, employeeID);

   //list inquirer for comfirming choice
    inquirer.prompt([confirmDelete.ask()]).then(respObj => {
        if (respObj.confirm_choice === "yes") {
            deleteQuery.delete(mainMenu);
        } else {
            mainMenu();
        }
    })
}

//function to update employee role
function updateEmpRole(employeeID, RolesArray) {
    console.log("Entered update employee role.")
    //consts for new role and id
    const empNewRole = new InquirerFunctions(inquirerTypes[2], 'employee_role', questions.updateRole, RolesArray);
    const queryGetRoleId = `SELECT role.id
                    FROM role
                    Where role.title = (?);`
    inquirer.prompt([empNewRole.ask()]).then(chosenRole => {
        //connection query to update role
        connection.query(queryGetRoleId, chosenRole.employee_role, function (err, res) {
            if (err) {
                throw err
            }

            const queryUpdateRoleId = `UPDATE employee
                                            SET employee.role_id = (?)
                                            WHERE employee.id = (?)`

            const updateEmpRoleId = new SQLquery(queryUpdateRoleId, [res[0].id, employeeID])

            updateEmpRoleId.update(mainMenu, "Employee Role Updated!");
        })
    })
}

//function to update employee manager
function updateEmpManager(employeeID, managerObjectArray) {
    console.log("Entered update employee manager.")
    //const for current manager
    const queryCurrentManager = `SELECT employee.manager_id
                                 FROM employee
                                 WHERE employee.id = (?);`
    connection.query(queryCurrentManager, employeeID, function (err, res) {
        if (err) {
            throw err;
        }
        //consts for manager id
        const currentManagerID = res[0].manager_id;

        const managerChoices = managerObjectArray.filter(manager => {
            if (manager.ID != currentManagerID) {
                return true;
            };
        })
        //new name for manager
        possibleNewManagerNames = [];
        for (manager of managerChoices) {
            managerName = "ID: " + manager.ID + " " + manager.firstName + " " + manager.lastName;
            possibleNewManagerNames.push(managerName);
        }
        //const for new inquirer functions and adding new name
        const newManagerChoice = new InquirerFunctions(inquirerTypes[2], 'new_Manager', questions.newManager, possibleNewManagerNames)
        //inquirer for updating manager
        inquirer.prompt([newManagerChoice]).then(userChoice => {
            const userInputSplitAtId = userChoice.new_Manager.split(" ", 2);
            const newManagerID = userInputSplitAtId[1];
            //const query 
            const queryUpdateNewManager = `UPDATE employee
                                            SET employee.manager_id = (?)
                                            WHERE employee.id = (?)`
            //connection query
            connection.query(queryUpdateNewManager, [newManagerID, employeeID], function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("Manager Updated!");
                mainMenu();
            })
        })
    })
}
//function to view all roles
function viewAllRoles() {
    const query = `SELECT role.title, role.salary, department.name
                    FROM role
                    INNER JOIN department ON department.id = role.department_id`
    const roleTable = new SQLquery(query);
    //show all roles then main menu
    roleTable.generalTableQuery(mainMenu);
}
//function to view all departments
function viewAllDep() {
    //const query 
    const query = `SELECT department.name
                    FROM department`

    const depTable = new SQLquery(query);
    //deptable
    depTable.generalTableQuery(mainMenu);
}
//function to add role
function addRole() {
    //const for selecting department name
    const queryDeps = "SELECT department.name FROM department;"
    connection.query(queryDeps, function (err, res) {

        if (err) throw err

        let depNameArr = []
        for (let i = 0; i < res.length; i++) {
            depNameArr.push(res[i].name)
        }
        //consts for role, salary, and department
        const whatRole = new InquirerFunctions(inquirerTypes[0], 'role_to_add', questions.newRole)
        const whatSalary = new InquirerFunctions(inquirerTypes[0], 'role_salary', questions.salary)
        const whatdepartment = new InquirerFunctions(inquirerTypes[2], 'department', questions.department, depNameArr)

        Promise.all([whatRole.ask(), whatSalary.ask(), whatdepartment.ask()]).then(prompts => {
            inquirer.prompt(prompts).then(userChoices => {

                const getDepId = `SELECT department.id FROM department WHERE department.name = (?);`
                connection.query(getDepId, userChoices.department, function (err, res) {
                    if (err) {
                        throw err
                    }
                    //const role and role query
                    const addRolequery = `INSERT INTO role (role.title, role.salary, role.department_id)
                                    VALUES ( (?), (?), (?));`
                    const addRole = new SQLquery(addRolequery, [userChoices.role_to_add, userChoices.role_salary, res[0].id]);

                    addRole.update(mainMenu, "Role added!");
                })
            })
        })
    })
}
//function to delete a role
function deleteRole(compRolesArr) {

    console.log("You've entered role delete")

    const whatRole = new InquirerFunctions(inquirerTypes[2], 'role_to_delete', questions.deleteRole, compRolesArr);
    inquirer.prompt([whatRole.ask()]).then(userChoice => {
        //const role id query
        const role_id_Query = `SELECT role.id FROM role WHERE role.title = (?);`
        connection.query(role_id_Query, userChoice.role_to_delete, function (err, res) {
            //const delete id, delete title
            const roleDeleteID = res[0].id;
            const roleDeleteTitle = userChoice.role_to_delete;
           //check to see if multiple roles have that title in multiple departments
            if (res.length > 1) {
                //user double confirmation
                console.log("Role found in multiple departments!");

                const departmentsWithRolequery = `SELECT department.name, role.department_id
                                                FROM department
                                                INNER JOIN role on role.department_id = department.id AND role.title = (?);`

                connection.query(departmentsWithRolequery, userChoice.role_to_delete, function (err, res) {
                    if (err) throw err
                    const departmentsWithRoleArr = [];
                    for (let department of res) {
                        departmentsWithRoleArr.push(department);
                    }

                    const whichDeparment = new InquirerFunctions(inquirerTypes[2], 'department_to_delete_Role_From', questions.departmentDeleteRole, departmentsWithRoleArr);

                    inquirer.prompt([whichDeparment.ask()]).then(userChoice => {
                        console.log(res);
                        const departmentName_ID_Arr = res.filter(department => {
                            if (department.name == userChoice.department_to_delete_Role_From) {
                                return true;
                            }
                        })

                        deleteRoleQuery2 = "DELETE FROM role WHERE role.title = (?) AND role.department_id = (?)"
                        const deleteInstance2 = new SQLquery(deleteRoleQuery2, [roleDeleteTitle, departmentName_ID_Arr[0].department_id])
                        deleteInstance2.delete(mainMenu);
                    })
                })

            } else {
                const deleteRoleQuery = "DELETE FROM role WHERE role.id = (?);"
                const deleteInstance = new SQLquery(deleteRoleQuery, roleDeleteID);
                deleteInstance.delete(mainMenu);
            }
        })
    })
}
//function to add a department
function addDep(depNameArr) {

    const whatDep = new InquirerFunctions(inquirerTypes[0], 'dep_to_add', questions.newDep)

    inquirer.prompt([whatDep.ask()]).then(userChoice => {

        const alreadyExist = depNameArr.filter(department => {

            if (department.name == userChoice.dep_to_add) return true;
        })

        if (alreadyExist.length >= 1) {
            console.log("Department Already exists!")
            mainMenu();
        } else {
            const addDepQuery = `INSERT INTO department (department.name) VALUES (?);`
            const addDep = new SQLquery(addDepQuery, userChoice.dep_to_add);

            addDep.update(mainMenu, "Department added!");
        }
    })
}
//final function to remove department
function removeDep(depNameArr) {

    const whatDepartment = new InquirerFunctions(inquirerTypes[0], 'dep_to_delete', questions.deleteDep)

    inquirer.prompt([whatDepartment.ask()]).then(userChoice => {

        const deleteDepQuery = `DELETE FROM department WHERE department.name = (?);`
        const deleteDep = new SQLquery(deleteDepQuery, userChoice.dep_to_delete);

        deleteDep.update(mainMenu, "Department deleted!");
    })
}
