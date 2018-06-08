class Calender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            year: new Date().getFullYear(),
            month: new Date().getMonth()+1
        }
    }

    backMonth() {
        this.setState({
            year:  (this.state.month == 1)  ? this.state.year - 1 : this.state.year,
            month: (this.state.month == 1)  ? 12                  : this.state.month - 1
        });
    }

    fowardMonth() {
        this.setState({
            year:  (this.state.month == 12)  ? this.state.year + 1 : this.state.year,
            month: (this.state.month == 12)  ? 1                   : this.state.month + 1
        });
    }

    changeDate(year, month) {
        this.setState({
            year:  (year  != undefined && IsNumeric(year) && year >= 1900) ? year : new Date().getFullYear(),
            month: (month != undefined && IsNumeric(month) && month >= 1 && month <= 12) ? month : new Date().getMonth() + 1
        });
    }

    render() {
        return (
            <div className="calender">
                <Navigation year={this.state.year} month={this.state.month} onChangeDate={(year, month) => this.changeDate(year, month)} onFowardMonth={(year, month) => this.fowardMonth(year, month)} onBackMonth={(year, month) => this.backMonth(year, month)}/>
                <Month year={this.state.year} month={this.state.month} />
            </div>
        );
    }
}

class Navigation extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var monthLabels = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
        var monthLabel = monthLabels[this.props.month-1];
        var years = [];

        var fiveYearsBack = parseInt(this.props.year) - 5;
        var fiveYearsFoward = parseInt(this.props.year) + 5;

        for(var i = fiveYearsBack; i < fiveYearsFoward; i++) {
            years.push(i);
        }

        return (
            <div className="navigation">
                <div className="arrows" onClick={this.props.onBackMonth}>
                    &#x2BC7;
                </div>
                <select className="form-control" value={this.props.month} onChange={(event) => this.props.onChangeDate(this.props.year, event.target.value)}>
                {
                    monthLabels.map((monthLabel, index) =>
                        <option key={monthLabel} value={index+1}>{monthLabel}</option>             
                    )
                }  
                </select>
                <select className="form-control" value={this.props.year} onChange={(event) => this.props.onChangeDate(event.target.value, this.props.month)}>
                {
                    years.map((year) =>
                        <option key={year}>{year}</option>
                    )
                }
                </select>
                <div className="arrows" onClick={this.props.onFowardMonth}>
                    &#x2BC8;
                </div>
            </div>
        );
    }
}

class Month extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            employeesVacation: []
        }

        this.lastMonth = this.props.month;
    }

    loadVacationOnMonth(that) {
        $.post("../Home/EmployeesVacation", { year: that.props.year, month: that.props.month }, function(data) {

            that.setState({
                employeesVacation: data
            });
            
            console.log('Load vacations from server, got: ' + that.state.employeesVacation.length + ' employees.');
        });
    }

    componentDidMount() {
        this.loadVacationOnMonth(this);

        // Check every 1 minutes
        this.timerId = setInterval(() => this.loadVacationOnMonth(this), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    render() {
        var year = this.props.year;
        var month = this.props.month;
        var monthDays = new Date(year, month, 0).getDate() + 1;
        var days = [];
        var employees = [];
        var handleDayClick = this.handleDayClick;
        var that = this;

        for(var i = 1; i < monthDays; i++) {
            days.push(i);
        }

        if(this.lastMonth != month) {
            this.lastMonth = month;
            this.loadVacationOnMonth(this);
        }

        this.state.employeesVacation.forEach((employeeVacation) => {
            employees.push(employeeVacation.Name);
        });

        return (
            <div>
                <div className="days">
                {
                    days.map((day) => 
                        <Day key={day} index={day} textData={day} className="" onDayClick={() => {return false;}} />
                    )
                }
                </div>
                <div className="employees-vacation">
                {
                    this.state.employeesVacation.map((employee) => 
                        <EmployeeVacation key={employee.Name} year={year} month={month} employee={employee} days={days} onUpdate={() => that.loadVacationOnMonth(that)} />
                    )
                }
                </div>
                <AddEmployee employees={employees} onUpdate={() => this.loadVacationOnMonth(this)}  />
            </div>
        );
    }
}

class AddEmployee extends React.Component {
    constructor (props) {
        super(props);

        this.employee = '';
    }

    changeEmployee(event) {
        this.employee = event.target.value;

        console.log("Change employee name to " + this.employee);
    }

    addEmployee() {
        var that = this;

        if(!this.props.employees.includes(this.employee)) {
            $.post("../Home/AddEmployee", { name: this.employee }, function () {
                console.log('Employee is added ' + that.employee);
    
                that.props.onUpdate();
            });
        }
        else {
            alert("Employee is already added to vacation calender!");
        }
    }

    render() {
        return(
            <div className="add-employee">
                <h3>Add a employee:</h3>
                <input type="text" className="form-control" onChange={(event) => this.changeEmployee(event)} />
                <p>
                    <button onClick={() => this.addEmployee()} className="btn btn-primary">Add</button>
                </p>
            </div>
        );
    }
}

// class AddVacation extends React.Component {
//     constructor(props) {
//         super(props);
//     }

//     changeEmployee(event) {
//         this.props.onChanges(this.props.year, this.props.month, this.props.selectedDay, event.target.value);

//         console.log("Change employee name");
//     }

//     changeDate(event) {
//         var matches = event.target.value.split("-");

//         this.props.onChanges(matches[0], matches[1], matches[2], this.props.selectedEmployee);

//         console.log("Change date");
//     }

//     addVacation() {
    // var selectedEmployee = (this.props.selectedEmployee.length > 0) ? this.props.selectedEmployee :  this.props.employees[0];
    // var that = this;

    // $.post("../Home/AddVacationDay", { year: this.props.year, month: this.props.month, day: this.props.day, employeeName: selectedEmployee }, function () {
    //     var nextDay = new Date(that.props.year, that.props.month-1, that.props.day);
    //     nextDay.setDate(nextDay.getDate() + 1);

    //     console.log('Vacation is added for employee ' + selectedEmployee + ' for day: ' + that.props.year + '-' + that.props.month + '-' + that.props.day + '.');

    //     that.props.onChanges(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate(), selectedEmployee);

    //     that.props.onUpdate();
    // });
//     }

//     render() {
                
//         var date = new Date(this.props.year, this.props.month - 1, this.props.day);

//         return(
//             <div className="add-vacation">
//                 <h2>Add a new vacation day:</h2>
//                 <input type="text" list="employees" className="form-control" value={this.props.selectedEmployee} onChange={(event) => this.changeEmployee(event)} />
//                 <datalist id="employees">
//                 {
//                     this.props.employees.map((employee) => {
//                         return (
//                             <option key={employee}>{employee}</option>
//                         )
//                     })
//                 }
//                 </datalist>
//                 <input type="date" className="form-control" value={DateToString(date)} onChange={(event) => this.changeDate(event)} />
//                 <p>
//                     <button onClick={() => this.addVacation()} className="btn btn-primary">Add</button>
//                 </p>
//             </div>
//         );
//     }
// }

class EmployeeVacation extends React.Component {
    constructor(props) {
       super(props);
    }

    handleDayClick(that, text, day, employee) {
        console.log("Click on day " + this.props.year + '-' + this.props.month + "-" + day + " for employee " + employee);

        if(text == 'S') {
            var removeChoice = confirm("Do you want to remove vacation for " + employee + " on " + this.props.year + '-' + this.props.month + "-" + day + "?");

            if(removeChoice) {
                that.removeVacationDay(that, day, employee);
            }
        }
        else {
            var addChoice = confirm("Do you want to add vacation for " + employee + " on " + this.props.year + '-' + this.props.month + "-" + day + "?");
            
            if(addChoice) {
                that.addVacationDay(that, day, employee);
            }            
        }
    }

    removeVacationDay(that, day, employee) {
        $.post("../Home/RemoveVacationDay", { year: that.props.year, month: that.props.month, day: day, employee: employee }, function() {

            console.log('Vacation is remove for employee ' + employee + ' on ' + that.props.year + '-' + that.props.month + '-' + day + '.');

            that.props.onUpdate();
        }, "html");
    }

    addVacationDay(that, day, employee) {
        $.post("../Home/AddVacationDay", { year: that.props.year, month: that.props.month, day: day, employeeName: employee }, function () {
            
            console.log('Vacation is added for employee ' + employee + ' for day: ' + that.props.year + '-' + that.props.month + '-' + day + '.');

            that.props.onUpdate();
        }, "html");
    }

    render() {
        var days = this.props.days;
        var employee = this.props.employee;
        var year = this.props.year;
        var month = this.props.month;
        var vacationsDays = [];
        var that = this;

        employee.VacationsDays.forEach(function(vacationDay) {
            vacationsDays.push(ConvertJSONDateToDate(vacationDay.Date));
        });

        return(
            <div className="employee-vacation">
                <Employee name={employee.Name} />
                {
                    days.map((day) => {
                        var className = GetClassNamesForDay(year, month, day);
                        var text = ""

                        if(CheckIfVacationDay(vacationsDays, year, month, day)) {
                            text = "S"
                            className += " vacation"
                        }

                        var index = day + '-' + employee.Name;
                        return <Day key={index} index={index} textData={text} className={className} onClick={(text) => that.handleDayClick(that, text, day, employee.Name)} />
                    })
                }
            </div>
        );
    }
}

class Day extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id={'day-' + this.props.index} className={'day' + this.props.className} onClick={() => this.props.onClick(this.props.textData)}>
                {this.props.textData}
            </div>
        );
    }
}

class Employee extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return(
            <div className="employee">
                {this.props.name}
            </div>
        );
    }
}

function CheckIfVacationDay(vacationsDays, year, month, day) {
    for(var vacationDay of vacationsDays) {
        var startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        var endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        if(vacationDay >= startOfDay && vacationDay <= endOfDay) {
            return true;
        }
    }

    return false;
}

function GetClassNamesForDay(year, month, day) {
    var date = new Date(year, month-1, day);
    var className = '';

    if(CheckIfWeekend(date)) {
        className = " weekend"
    }

    if(CheckIfToday(date)) {
        className += " today"
    }

    return className;
}

function CheckIfWeekend(date) {
    var weekday = date.getDay();

    return (weekday == 6 || weekday == 0);
}

function CheckIfToday(date) {
    return (date.setHours(0,0,0,0) == new Date().setHours(0,0,0,0));
}

function ConvertJSONDateToDate(JsonDate) { 
    return new Date(JsonDate.match(/\d+/)[0] * 1);
}

function DateToString(date) {
    var yyyy = date.getFullYear().toString();                                    
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based         
    var dd  = date.getDate().toString();             

    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
}

function IsNumeric(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}

ReactDOM.render(
    <Calender />,
    document.getElementById("calender")
);