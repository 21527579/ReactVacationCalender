using System;
using System.ComponentModel.DataAnnotations;

namespace VacationCalender.Models
{
    public class VacationDay
    {
        public int Id { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime Date { get; set; }
        public int EmployeeId { get; set; }
    }
}