using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using VacationCalender.Models;

namespace VacationCalender.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public JsonResult EmployeesVacation(int year, int month)
        {
            //string _connectionString = ConfigurationManager.ConnectionStrings["Db"].ConnectionString;
            List<Employee> employees = DatabaseHandler.GetEmployeesVacation(year, month);

            if (employees.Any())
            {
                return Json(employees);
            }
            else
            {
                return null;
            }
        }

        public void AddVacationDay(int year, int month, int day, string employeeName)
        {
            Employee employee = DatabaseHandler.GetEmployee(employeeName);

            if (employee == null)
            {
                employee = new Employee { Name = employeeName };
                employee.Id = DatabaseHandler.AddEmployee(employee);
            }

            VacationDay vacationDay = new VacationDay { Date = new DateTime(year, month, day), EmployeeId = employee.Id };

            VacationDay existingVacationDay = DatabaseHandler.GetVacationDay(vacationDay.Date, employee.Id);
            if (existingVacationDay == null)
            {
                DatabaseHandler.AddVacationDay(vacationDay);
            }
            else
            {
                Response.StatusCode = (int)HttpStatusCode.Conflict;
            }
        }

        public void RemoveVacationDay(int year, int month, int day, string employee)
        {
            DateTime date = new DateTime(year, month, day);

            DatabaseHandler.RemoveVacationDay(date, employee);
        }

        public void AddEmployee(string name)
        {
            Employee employee = DatabaseHandler.GetEmployee(name);

            if (employee == null)
            {
                employee = new Employee { Name = name };

                employee.Id = DatabaseHandler.AddEmployee(employee);
            }
            else
            {
                Response.StatusCode = (int)HttpStatusCode.Conflict;
            }
        }
    }
}