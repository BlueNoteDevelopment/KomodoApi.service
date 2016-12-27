# KomodoApi.service
Service layer for Komodo Api app

##Runtime Query Format
Runtime parameters such as dates can be parameterized an resolved at runtime for SQL queries or in other instances where a calculated date is used.

###Format:
{valueType:paramType[paramOptions]}

i.e.
`{dt:lm[f]}`  => date : last month start on first day

paramOptions can be a comma separated list.

i.e.
`{dt:lm[f,eod]}`  => date : last month start on first day with time value of 23:59:59

ValueType: dt


| paramOption|Description|Options|
| ------------- |-------------| -----|
| lm (lastmonth)| last month from current | [f,l][sod,eod]|
| cm (currentmonth)| current month | [f,l][sod,eod]|
| lw (lastweek)| last week from current | [f,l][sod,eod][mon]|
| cw (currentweek)| current week | [f,l][sod,eod][mon]|

Options

|Option|Used With|Description|
|------|---------|-----------|
|f {first}|lm,cm |first day of the month|
|         |lw,cw |first day of the week |
|l {last}|lm,cm |last day of the month|
|         |lw,cw |last day of the week |
|sod {startofday}|lm,cm,lw,cw |adds a time value of 00:00:00.0 to date|
|eod {endofday}|lm,cm,lw,cw |adds a time value of 23:59:59.999 to date|
|mon         |lw,cw |calculate start of week from Monday (End of week is Sunday)|



