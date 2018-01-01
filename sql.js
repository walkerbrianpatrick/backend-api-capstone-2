const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
// to enforce foreign key constraints, it needs to be turned on when you connect
db.run('PRAGMA foreign_keys = ON');

// Initialize the tables required for the server
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS Employee (' +
          'id INTEGER PRIMARY KEY, ' +
          'name TEXT NOT NULL, ' +
          'position TEXT NOT NULL, ' +
          'wage INTEGER NOT NULL, ' +
          'is_current_employee INTEGER DEFAULT 1' +
          ')', err => {
              if (err){
                console.log('Creating Employee table failed with following error.');
                console.log(err);
              }
        });

  db.run('CREATE TABLE IF NOT EXISTS Timesheet (' +
          'id INTEGER PRIMARY KEY, ' +
          'hours INTEGER NOT NULL, ' +
          'rate INTEGER NOT NULL, ' +
          'date INTEGER NOT NULL, ' +
          'employee_id INTEGER NOT NULL, ' +
          'FOREIGN KEY(employee_id) REFERENCES Employee(id)' +
          ')', err => {
              if (err){
                console.log('Creating Timesheet table failed with following error.');
                console.log(err);
              }
        });

  db.run('CREATE TABLE IF NOT EXISTS Menu (' +
          'id INTEGER PRIMARY KEY, ' +
          'title TEXT NOT NULL ' +
          ')', err => {
              if (err){
                console.log('Creating Menu table failed with following error.');
                console.log(err);
              }
        });

  db.run('CREATE TABLE IF NOT EXISTS MenuItem (' +
          'id INTEGER PRIMARY KEY, ' +
          'name TEXT NOT NULL, ' +
          'description TEXT, ' +
          'inventory INTEGER NOT NULL, ' +
          'price INTEGER NOT NULL, ' +
          'menu_id INTEGER NOT NULL, ' +
          'FOREIGN KEY(menu_id) REFERENCES Menu(id)' +
          ')', err => {
              if (err){
                console.log('Creating MenuItem table failed with following error.');
                console.log(err);
              }
        });
});

// Employee query construtors
// =============================================================================
const getAllEmployees = () => {
  return "SELECT * FROM Employee";
};

const getAllCurrentEmployees = () => {
  return "SELECT * FROM Employee WHERE is_current_employee = 1";
};

const getEmployeeById = id => {
  return "SELECT * FROM Employee WHERE id = " + id;
};

const createEmployee = employee => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (employee['name'] && employee['position'] && employee['wage'])
  {
    return 'INSERT INTO Employee (name, position, wage) VALUES (' +
            `'${employee.name}', ` +
            `'${employee.position}', ` +
            `${employee.wage})`;
  }
  return '';
};

const updateEmployee = (employeeId, employee) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (employee['name'] && employee['position'] && employee['wage'])
  {
    return 'UPDATE Employee ' +
            `SET name = '${employee.name}', ` +
            `position = '${employee.position}', ` +
            `wage = ${employee.wage} ` +
            `WHERE id =  ${employeeId}`;
  }
  return '';
};

const deleteEmployee = (employeeId) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  return 'UPDATE Employee ' +
            `SET is_current_employee = 0 ` +
            `WHERE id = ${employeeId}`;

};

const getAllEmployeeIds = () => {
  return 'SELECT DISTINCT id FROM Employee';
};

// Timesheet query construtors
// =============================================================================
const getAllTimesheetsByEmployeeId = (employeeId) => {
  return `SELECT * FROM Timesheet WHERE employee_id = ${employeeId}`;
};


const createTimesheet = (employeeId, timesheet) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (timesheet['hours'] && timesheet['rate'] && timesheet['date'] && employeeId)
  {
    return 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES (' +
            `${timesheet.hours}, ` +
            `${timesheet.rate}, ` +
            `${timesheet.date}, ` +
            `${employeeId}` +
            ')';
  }
  return '';
};

const updateTimesheet = (employeeId, timesheetId, timesheet) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (timesheet['hours'] && timesheet['rate'] && timesheet['date'] && employeeId && timesheetId)
  {
    return 'UPDATE Timesheet ' +
            `SET hours = '${timesheet.hours}', ` +
            `rate = '${timesheet.rate}', ` +
            `date = '${timesheet.date}', ` +
            `employee_id = ${employeeId} ` +
            `WHERE id =  ${timesheetId}`;
  }
  return '';
};


const getAllTimesheetIds = () => {
  return 'SELECT DISTINCT id FROM Timesheet';
};


const deleteTimesheet = (timesheetId) => {
  return 'DELETE FROM Timesheet ' +
            `WHERE id = ${timesheetId}`;

};

// Menu query construtors
// =============================================================================
const getAllMenus = () => {
  return `SELECT * FROM Menu`;
};

const getAllMenuIds = () => {
  return 'SELECT DISTINCT id FROM Menu';
};

const getMenuById = id => {
  return "SELECT * FROM Menu WHERE id = " + id;
};

const createMenu = menu => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (menu['title'] )
  {
    return 'INSERT INTO Menu (title) VALUES (' +
            `'${menu.title}')`;
  }
  return '';
};

const updateMenu = (menuId, menu) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (menu['title'] && menuId)
  {
    return 'UPDATE Menu ' +
            `SET title = '${menu.title}' ` +
            `WHERE id =  ${menuId}`;
  }
  return '';
};

const deleteMenu = (menuId) => {

  return 'DELETE FROM Menu ' +
            `WHERE id = ${menuId}`;

};


// Menu Item query constructors
// =============================================================================
const getAllMenuItemsByMenuId = (menuId) => {
  return `SELECT * FROM MenuItem WHERE menu_id = ${menuId}`;
};

const getAllRelatedMenus = () => {
  return 'SELECT DISTINCT menu_id FROM MenuItem';
};

const createMenuItem = (menuId, menuItem) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (menuItem['name'] && menuItem['inventory'] && menuItem['price'] && menuId)
  {
    let descriptionName = '';
    let descriptionValue = '';
    if(menuItem['description'])
    {
      descriptionName = ', description';
      descriptionValue = `, '${menuItem.description}'`;
    }

    return 'INSERT INTO MenuItem (name, inventory, price, menu_id' +
            descriptionName +
            ') VALUES (' +
            `'${menuItem.name}', ` +
            `${menuItem.inventory}, ` +
            `${menuItem.price}, ` +
            `${menuId}` +
            descriptionValue +
            ')';
  }
  return '';
};

const getAllMenuItemIds = () => {
  return 'SELECT DISTINCT id FROM MenuItem';
};



const updateMenuItem = (menuId, menuItemId, menuItem) => {
  // Sqlite appears to not be preventing creation of an entry if the name is NULL
  // so this condition is enforcing it.
  if (menuItem['name'] && menuItem['inventory'] && menuItem['price'] && menuId && menuItemId)
  {
    let descriptionString = '';
    if(menuItem['description'])
    {
      descriptionString = `, description = '${menuItem.description}' `;
    }

    return 'UPDATE MenuItem ' +
            `SET name = '${menuItem.name}', ` +
            `inventory = '${menuItem.inventory}', ` +
            `price = '${menuItem.price}', ` +
            `menu_id = ${menuId} ` +
            descriptionString +
            `WHERE id =  ${menuItemId}`;
  }
  return '';
};


const deleteMenuItem = (menuItemId) => {
  return 'DELETE FROM MenuItem ' +
            `WHERE id = ${menuItemId}`;

};

module.exports = {
  getAllEmployees,
  getAllCurrentEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployeeIds,
  getAllTimesheetsByEmployeeId,
  createTimesheet,
  updateTimesheet,
  getAllTimesheetIds,
  deleteTimesheet,
  getAllMenus,
  getAllMenuIds,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  getAllRelatedMenus,
  getAllMenuItemsByMenuId,
  createMenuItem,
  getAllMenuItemIds,
  updateMenuItem,
  deleteMenuItem

}
