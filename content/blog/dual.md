---
Title: "What is the dual table in your Oracle database"
Summary: "And when it may be used."
---

Sometimes in Select SQL queries you can see a mythic
"dual" table. What the hell is it? Let's see what is inside:

```sql
slect *
from dual
```

```
dummy
--------
X
```

So, this table contains one column (`dummy`)
and one row (with `X` value). But this value isn't
important at all, because the `dual` table is used 
when some "static" results  are required. The fact is that
Oracle **requires a table name** in `select from` queries,
while selected data may be absolutely independent from tables
used in a query. Because the `dual` table has only one row,
all constants are returned only once.
Here are a few examples:

Get constant values:

```sql
select 23
from dual
```

```sql
select 12 + 42
from dual
```

In the next example the value for parameter `pvalue` comes from outside,
and the result of the query depends on it only, not any data in a database:

```sql
select decode(:pvalue, 1, 'True', 'False')
from dual
```

Get a list of numbers:

```sql
select level lvl
from dual
connect by level < 11;
```

Output:

```
 LVL
----------
         1
         2
         3
         4
         5
         6
         7
         8
         9
        10
```
