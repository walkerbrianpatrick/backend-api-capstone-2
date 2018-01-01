const express = require('express');
const apiRouter = express.Router();
const sqlite3 = require('sqlite3');
// Import the sql functions
const  {getAllEmployees,
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
        deleteMenuItem} = require('../sql');

// open up the database for use
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
// to enforce foreign key constraints, it needs to be turned on when you connect
db.run('PRAGMA foreign_keys = ON');



// Employee Routes
// =============================================================================
// request all currently employed employees
apiRouter.get('/employees', (req, res, next) => {
  let employeeQuery = getAllCurrentEmployees();
  db.serialize( () => {
    db.all(employeeQuery, (error,rows) => {
      if (error){
        console.log('request for all employees failed with code:');
        console.log(error);
        return;
      }
      if (rows) {
        res.status(200).send({employees: rows});
      } else {
        res.status(404).send();
      }
    });
  });
});

// request the information about a specific employee by id
apiRouter.get('/employees/:employeeId', (req, res, next) => {
  let employeeQuery = getEmployeeById(req.params.employeeId);
  db.serialize( () => {
    db.get(employeeQuery, (error,row) => {
      if (error){
        console.log('request for employee by id failed with code:');
        console.log(error);
        return;
      }
      if (row) {
        res.status(200).send({employee: row});
      } else {
        res.status(404).send();
      }
    });
  });

});

// create a new employee
apiRouter.post('/employees', (req, res, next) => {
  let employeeQuery = createEmployee(req.body.employee);
  db.serialize( () => {
    db.run(employeeQuery, function (error) {
      if (error){
        console.log('request to creat employee failed with code:');
        console.log(error);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, result) => {
        if(err){
          console.log(err);
        };
        if (result) {
          res.status(201).send({employee: result});
        } else {
          res.status(400).send();
        }
      });
    });
  });
});

// update the record for a specific employee
apiRouter.put('/employees/:employeeId', (req, res, next) => {
    const employeeQuery = updateEmployee(req.params.employeeId, req.body.employee);
    db.run(employeeQuery, (err) => {
      if (err){
        console.log('updating employee information failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, result) => {
        if(err){
          console.log('failure in grabbing updated employee');
          console.log(err);
        };
        if (result) {
          res.status(200).send({employee: result});
        } else {
          res.status(400).send();
        }
      });

    });
});

// approximately fire this employee
apiRouter.delete('/employees/:employeeId', (req, res, next) => {
    const employeeQuery = deleteEmployee(req.params.employeeId);
    db.run(employeeQuery, (err) => {
      if (err){
        console.log('deleting employee information failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, result) => {
        if(err){
          console.log('failure in grabbing updated employee');
          console.log(err);
        };
        if (result) {
          res.status(200).send({employee: result});
        } else {
          res.status(400).send();
        }
      });

    });
});

// Timesheet Routes
// =============================================================================
// request all timesheets for an existing employee
apiRouter.get('/employees/:employeeId/timesheets', checkEmployeeId, (req, res, next) => {

  let timesheetQuery = getAllTimesheetsByEmployeeId(req.params.employeeId);
  db.serialize( () => {
    db.all(timesheetQuery, (error,rows) => {
      if (error){
        console.log('request for all timesheets by employee id failed with code:');
        console.log(error);
        res.status(404).send();
        return;
      }
      if (rows) {
        res.status(200).send({timesheets: rows});
      } else {
        res.status(404).send();
      }
    });
  });
});

// create a new timesheet
apiRouter.post('/employees/:employeeId/timesheets', checkEmployeeId, (req, res, next) => {
  let timesheetQuery = createTimesheet(req.params.employeeId,req.body.timesheet);
  //console.log(timesheetQuery);
  db.serialize( () => {
    db.run(timesheetQuery, function (error) {
      if (error){
        console.log('request to creat timesheet failed with code:');
        console.log(error);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, result) => {
        if(err){
          console.log(err);
        };
        if (result) {
          res.status(201).send({timesheet: result});
        } else {
          res.status(400).send();
        }
      });
    });
  });
});

// update a timesheet for a specific employee
apiRouter.put('/employees/:employeeId/timesheets/:timesheetId',
    checkEmployeeId,
    checkTimesheetId,
    (req, res, next) => {
    const employeeQuery = updateTimesheet(req.params.employeeId,
                                          req.params.timesheetId,
                                          req.body.timesheet);
    db.run(employeeQuery, (err) => {
      if (err){
        console.log('updating timesheet information failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, result) => {
        if(err){
          console.log('failure in grabbing updated timesheet');
          console.log(err);
        };
        if (result) {
          res.status(200).send({timesheet: result});
        } else {
          res.status(400).send();
        }
      });

    });
});

// delete a timesheet from the database
apiRouter.delete('/employees/:employeeId/timesheets/:timesheetId',
  checkTimesheetId,
  (req, res, next) => {
    const timesheetQuery = deleteTimesheet(req.params.timesheetId);
    db.run(timesheetQuery, (err) => {
      if (err){
        console.log('deleting timesheet information failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      res.status(204).send();
      });
});

// Menu Routes
// =============================================================================
// request all Menus
apiRouter.get('/menus', (req, res, next) => {

  let menuQuery = getAllMenus();
  db.serialize( () => {
    db.all(menuQuery, (error,rows) => {
      if (error){
        console.log('request for all menus failed with code:');
        console.log(error);
        res.status(404).send();
        return;
      }
      if (rows) {
        res.status(200).send({menus: rows});
      } else {
        res.status(404).send();
      }
    });
  });
});

// request the information about a specific menu by id
apiRouter.get('/menus/:menuId', checkMenuId, (req, res, next) => {
  let menuQuery = getMenuById(req.params.menuId);
  db.serialize( () => {
    db.get(menuQuery, (error,row) => {
      if (error){
        console.log('request for menu by id failed with code:');
        console.log(error);
        return;
      }
      if (row) {
        res.status(200).send({menu: row});
      } else {
        res.status(404).send();
      }
    });
  });

});

// create a new Menu
apiRouter.post('/menus', (req, res, next) => {
  let menuQuery = createMenu(req.body.menu);
  db.serialize( () => {
    db.run(menuQuery, function (error) {
      if (error){
        console.log('request to create menu failed with code:');
        console.log(error);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, result) => {
        if(err){
          console.log(err);
        };
        if (result) {
          res.status(201).send({menu: result});
        } else {
          res.status(400).send();
        }
      });
    });
  });
});

// update a menu
apiRouter.put('/menus/:menuId',
    checkMenuId,
    (req, res, next) => {
    const menuQuery = updateMenu(req.params.menuId,
                                     req.body.menu);
    db.run(menuQuery, (err) => {
      if (err){
        console.log('updating menu information failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, result) => {
        if(err){
          console.log('failure in grabbing updated Menu');
          console.log(err);
        };
        if (result) {
          res.status(200).send({menu: result});
        } else {
          res.status(400).send();
        }
      });
    });
});

// delete a menu from the database
apiRouter.delete('/menus/:menuId',
  checkMenuId,
  checkNoRelatedMenuItems,
  (req, res, next) => {
    const menuQuery = deleteMenu(req.params.menuId);
    db.run(menuQuery, (err) => {
      if (err){
        console.log('deleting menu failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      res.status(204).send();
      });
});


// Menu Item Routes
// =============================================================================
// request all Menu Items
apiRouter.get('/menus/:menuId/menu-items',
  checkMenuId,
  (req, res, next) => {
  let menuItemQuery = getAllMenuItemsByMenuId(req.params.menuId);
  db.serialize( () => {
    db.all(menuItemQuery, (error,rows) => {
      if (error){
        console.log('request for all menu items by menu id failed with code:');
        console.log(error);
        res.status(404).send();
        return;
      }
      if (rows) {
        res.status(200).send({menuItems: rows});
      } else {
        res.status(404).send();
      }
    });
  });
});


// create a new menu item
apiRouter.post('/menus/:menuId/menu-items', checkMenuId,
  (req, res, next) => {
  let menuItemQuery = createMenuItem(req.params.menuId,req.body.menuItem);
  db.serialize( () => {
    db.run(menuItemQuery, function (error) {
      if (error){
        console.log('request to create menu item failed with code:');
        console.log(error);
        res.status(400).send();
        return;
      }

      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, result) => {
        if(err){
          console.log(err);
        };
        if (result) {
          res.status(201).send({menuItem: result});
        } else {
          res.status(400).send();
        }
      });
    });
  });
});


// update a menu item for a specific menu
apiRouter.put('/menus/:menuId/menu-items/:menuItemId',
    checkMenuId,
    checkMenuItemId,
    (req, res, next) => {
    const menuItemQuery = updateMenuItem(req.params.menuId,
                                          req.params.menuItemId,
                                          req.body.menuItem);
    db.run(menuItemQuery, (err) => {
      if (err){
        console.log('updating menuItem information failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, result) => {
        if(err){
          console.log('failure in grabbing updated MenuItem');
          console.log(err);
        };
        if (result) {
          res.status(200).send({menuItem: result});
        } else {
          res.status(400).send();
        }
      });

    });
});

// delete a timesheet from the database
apiRouter.delete('/menus/:menuId/menu-items/:menuItemId',
  checkMenuItemId,
  (req, res, next) => {
    const menuItemQuery = deleteMenuItem(req.params.menuItemId);
    db.run(menuItemQuery, (err) => {
      if (err){
        console.log('deleting menu item failed with code:');
        console.log(err);
        res.status(400).send();
        return;
      }
      res.status(204).send();
      });
});

// Useful callback functions
// =============================================================================
function checkEmployeeId(req, res, next) {
  let employeeNumberQuery = getAllEmployeeIds();
  db.all(employeeNumberQuery, (error, rows) => {
    let employeeNumFound = 0;
    for (let i0 = 0; i0 < rows.length; i0++)
    {
      if (parseInt(rows[i0].id) === parseInt(req.params.employeeId))
      {
        employeeNumFound = 1;
        break;
      }
    }
    if (!employeeNumFound){
      res.status(404).send();
      return;
    } else {
      next();
    }
  });
}

function checkTimesheetId(req, res, next) {
  let timesheetNumberQuery = getAllTimesheetIds();
  db.all(timesheetNumberQuery, (error, rows) => {
    let timesheetNumFound = 0;
    for (let i0 = 0; i0 < rows.length; i0++)
    {
      if (parseInt(rows[i0].id) === parseInt(req.params.timesheetId))
      {
        timesheetNumFound = 1;
        break;
      }
    }
    if (!timesheetNumFound){
      res.status(404).send();
      return;
    } else {
      next();
    }
  });
}

function checkMenuId(req, res, next) {
  let menuNumberQuery = getAllMenuIds();
  db.all(menuNumberQuery, (error, rows) => {
    let menuNumFound = 0;
    for (let i0 = 0; i0 < rows.length; i0++)
    {
      if (parseInt(rows[i0].id) === parseInt(req.params.menuId))
      {
        menuNumFound = 1;
        break;
      }
    }
    if (!menuNumFound){
      res.status(404).send();
      return;
    } else {
      next();
    }
  });
}

function checkNoRelatedMenuItems(req, res, next) {
  let menuRelatedQuery = getAllRelatedMenus();
  db.all(menuRelatedQuery, (error, rows) => {
    let menuRelatedFound = 0;
    for (let i0 = 0; i0 < rows.length; i0++)
    {
      if (parseInt(rows[i0].menu_id) === parseInt(req.params.menuId))
      {
        menuRelatedFound = 1;
        break;
      }
    }
    if (menuRelatedFound){
      res.status(400).send();
      return;
    } else {
      next();
    }
  });
}

function checkMenuItemId(req, res, next) {
  let menuItemNumberQuery = getAllMenuItemIds();
  db.all(menuItemNumberQuery, (error, rows) => {
    let menuItemNumFound = 0;
    for (let i0 = 0; i0 < rows.length; i0++)
    {
      if (parseInt(rows[i0].id) === parseInt(req.params.menuItemId))
      {
        menuItemNumFound = 1;
        break;
      }
    }
    if (!menuItemNumFound){
      res.status(404).send();
      return;
    } else {
      next();
    }
  });
}


module.exports = apiRouter;
