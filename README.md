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


| paramOption| Description| Options|
| ------------- |-------------| -----|
| lm (lastmonth)| last month from current | [f,l][sod,eod]|
| cm (currentmonth)| current month | [f,l][sod,eod]|
