using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using Dapper.Contrib.Extensions;

namespace VacationCalender.Models
{
    public static class DatabaseHandler
    {
        private static string _connectionString = "Data Source=(LocalDB)\\v12.0;Initial Catalog=VacationCalender;Integrated Security=True"; //ConfigurationManager.ConnectionStrings["Db"].ConnectionString;

        public static List<Employee> GetEmployeesVacation(int year, int month)
        {
            List<Employee> employees;

            string sql = "SELECT e.* " +
                         "FROM Employees AS e " +
                         "ORDER BY e.Name ASC";

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                employees = connection.Query<Employee>(sql).ToList();
            }

            if(employees != null)
            {
                foreach(Employee employee in employees)
                {
                    employee.VacationsDays = GetVacationDays(year, month, employee.Id);
                }  
            }

            return employees;
        }

        public static Employee GetEmployee(string name)
        {
            string sql = "SELECT * " +
                         "FROM Employees AS e " +
                         "WHERE e.Name = @Name";

            SqlConnection connection = new SqlConnection(_connectionString);
            connection.Open();

            return connection.Query<Employee>(sql, new { Name = name }).FirstOrDefault();
        }

        public static List<VacationDay> GetVacationDays(int year, int month, int employeeId)
        {
            DateTime firstDayOfMonth = new DateTime(year, month, 1);
            DateTime lastDayOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month));

            string sql = "SELECT * " +
                         "FROM VacationDays AS v " +
                         "WHERE v.EmployeeId = @EmployeeId AND v.Date >= @FirstDay AND v.Date <= @LastDay ";

            SqlConnection connection = new SqlConnection(_connectionString);
            connection.Open();

            return connection.Query<VacationDay>(sql, new { FirstDay = firstDayOfMonth, LastDay = lastDayOfMonth, EmployeeId = employeeId }).ToList();
        }

        public static VacationDay GetVacationDay(DateTime date, int employeeId)
        {
            string sql = "SELECT * " +
                         "FROM VacationDays " +
                         "WHERE Date = @Date AND EmployeeId = @EmployeeId";

            SqlConnection connection = new SqlConnection(_connectionString);
            connection.Open();

            return connection.Query<VacationDay>(sql, new { Date = date, EmployeeId = employeeId }).FirstOrDefault();
        }

        public static int AddEmployee(Employee employee)
        {
            SqlConnection connection = new SqlConnection(_connectionString);
            connection.Open();

            return (int)connection.Insert(employee);
        }

        public static int AddVacationDay(VacationDay vacation)
        {
            SqlConnection connection = new SqlConnection(_connectionString);
            connection.Open();

            return (int)connection.Insert(vacation);
        }

        public static void RemoveVacationDay(DateTime date, string employeeName)
        {
            Employee employee = GetEmployee(employeeName);

            if(employee != null)
            {
                string sql = "DELETE " +
                             "FROM VacationDays " +
                             "WHERE EmployeeId = @employeeId AND Date = @Date";

                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    connection.Execute(sql, new { Date = date, EmployeeId = employee.Id });
                }
            }
        }
    }
}