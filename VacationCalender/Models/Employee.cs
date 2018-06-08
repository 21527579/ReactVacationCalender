using Dapper.Contrib.Extensions;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VacationCalender.Models
{
    public class Employee
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string Name { get; set; }

        [Write(false)]
        public List<VacationDay> VacationsDays { get; set; }

        public Employee()
        {
            VacationsDays = new List<VacationDay>();
        }
    }
}