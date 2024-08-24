---
title: "Audit techniques in RDBMS"
date: 2021-12-26
toc: true
---

This article will tell you about some
techniques that can help you to track changes
which were performed on database tables.
It is recommended to know SQL basics to understand
some queries examples that are shown here, so if 
you are unfamiliar with SQL, you can read a simple
[SQL tutorial for beginners](/blog/sqltutorial).

## Why is audit needed?

Audit is the thing that is required rarely, but you
can't guess when exactly you will need it, and because
of this you need to track changes all the time. The most 
general tasks that audit serves for are:

- Detect what changes were performed
- Restore previous versions of rows in tables
- Logging user activity. Audit data can be used
  for analytic purposes as telemetry dataset.How
  often some specific user updates some specific table?
  What operating system or executable module he uses more
  often or during some specific period of time? What kind of
  data is changed by users more often, and so on. All these
  questions can be answered by researching audit data.


## Additional columns

The most simple way that you can do to be able to track
changes on tables is to add columns that will store
info about data modifications, like when a row was created,
who created it, when the row was modified last time and by whom.

It looks like this:

| order_no     | order_cost| status     | create_date | create_user | last_modified | user_modified |
|--------------|-----------|------------|-------------|-------------|---------------|---------------|
| `1` | `1.99`      | `7`          |`2021-01-01`| `ann`|`null`|`null`|
| `2`      | `1.89`      | `5234`       |`2021-01-01`| `johndoe`|`2021-01-28`|`admin`|


In addition to the basic columns, there are also a few audit columns: `create_date`,
`create_user`, `last_modified` and `user_modified`.

We can see that the row with `order_no = 1` was created by the user `ann`, and
since its creation, the row hasn't changed, because `last_modified` and `user_modified`
columns are empty.

The `create_date` and `create_user` columns are filled with corresponding
data at the moment of data insertion to the table and they
**shouldn't be modified** in the future. The actual implementation of such
functionality depends on the database you use. In Oracle and Microsoft SQL Server
it can be(and most probably, should be) implemented by using columns' default values.


## Change tables

**Warning!**  This way is considered as an antipattern, so you should avoid it
in your database.

Change tables are  the tables that store audit data along with the state
of the changed row, represented as single string (Let's name this table `order_audit`):

| user | action |action_date| state |
|-|-|-|-|
|`ann`|`insert`| `2021-01-01` |`order_no=1;order_cost=1.99;status=7`|
|`johndoe`|`insert`| `2021-01-01`| `order_no=2;order_cost=1.89;status=5234`|
|`ann`|`update`| `2021-01-03` |`order_no=1;status=8`|
|`admin`|`delete`| `2021-01-03` |`order_no=1;order_cost=1.99;status=8`|

Here, we can see that when a user makes any change with a table row,
another one row is added to the `order_audit` table, where all changes
that were applied to the row are aggregated into a single string.
When the user deletes a row, we also log this action by aggregating
the values of all columns in the row.
If we want to see all changes that user `ann` did with the table `orders`, 
we can write a simple query, like this:

```foo
select *
from order_audit
where user = 'ann'
```

While this approach is much better than just a few additional
columns, it has some critical disadvantages:

- It's very hard to track changes for individual columns or some
  set of them, because the `state` column contains all changes that
  were applied, and we need an additional code to fetch specific changes.
  Even after that it's hard to do something with this data, because
  all we will have is a column name and the _string_ representation of
  its value.
- This is a direct consequence of the previous paragraph: it's hard to
  get a specific change. While it's easy in simple cases, things become
  bad if we have a string value that contains the same character as
  the character we use for separating column changes in the aggregated string.
  For example, a user can write text "Please call before delivery; I can be not
  at home" in the order notes field, and if we use a semicolon, our `state`
  string may looks like this: `id=2;order_date=2021-01-01;note=Please call
  before delivery; I can be not at home`. Such sutuations make it difficult
  to split string, and we need additional logic - when we generate a value
  for the `state` column or when we are fetching single changes from string,
  or, more probably, in both places.
- It's hard to get the value of a column that wasn't changed, because it is
  not represented in the change string. Though, this one may be fixed
  by saving values of all rows in a row.
- Since changes are represented as strings, we have to develop formatting conventions for
  different types, and it's mostly about dates: how should they be represented as strings?
  And once picked, format should be used forever, or it will be a fucking puzzle to
  work with date changes( Imagine yourself trying to write some code that should work with
  date strings like "2022-01-01", "01/01/2022", "01.03.2022 23:45:00", and it can be even
  not a full list of all possible formats).

## Master-detail audit tables

With this approach we create one master table to handle the main info
about changes in our tables and one table for changes itself. The main
difference from the previous approach is that we store the value of each column
in a separate row, and by doing this, we are fixing one of the main disadvantages of
the previous method - finding out changes for a concrete
column in a performed transaction.

Here are the examples of such structure - the `audit_master` table
holds info about all operations that were made alongside with
information about operation itself(insert, update ,delete), 
user, and operation type. Of course, there are other possible columns
for the main audit, such as the host machine, client application and ip address,
but in the sake of simplicity, we will use more compact audit metadata.

*audit_master* table:

| id | oper | oper_date | user | table_name |
|-|-|-|-|-|
|`1`|`I`|`2021-01-01 10:43`|`ann`| `orders` |
|`2`|`U`|`2021-01-01 10:45`|`ann`| `orders` |
|`3`|`U`|`2021-01-01 13:40`|`ann`| `orders` |
|`4`|`I`|`2021-01-01 15:40`|`admin`| `orders` |

*audit_detail* table:

|id| master_id| column_name|column_value|
|-|-|-|-|
|`1`|`1`|`i`|`1`|
|`2`|`1`|`order_date`|`2021-01-01`|
|`3`|`1`|`order_cost`|`23`|
|`4`|`1`|`id`|`2`|
|`5`|`1`|`order_date`|`2021-01-02`|
|`6`|`1`|`order_cost`|`1.89`|

Now it's easy to find out which columns were changed:

```foo
select *
from audit_detail ad
where ad.master_id = :paudit_id
```

Note that to be able to keep changes for all columns,
we need to use string type for `column_value`
column and convert all types to string type by hands.
And of course we have to use formatting conventions for
dates and nulls.

## Shadow tables

Shadow table is a table that contains all columns
that its watched table has (with the same data types),
with a few additional audit columns. Unlike the first
two, this solution keeps historical
data for all columns, even if they were not changed. It may
look redundant, but we will see soon that this is the feature of 
this method. So, how should it be in a database? Each table that
has to be audited, has its own audit table. Before each change, we
save copy of a table row into the audit table alongside with
audit info, for example:

- Operation(Insert, Update or Delete)
- Operation date(with time, of course)
- Who made change(username of user id)
- Ip address

What we should save before committing changes:

- On insert, save new inserted row
- On update, save new updated row
- On delete, save current row

So, for the `orders` table, we need to create an
audit table. All audit tables **must** have the same
naming convention, or it will be hard for other developers
to find out where they can look for changes history.
In our example, we will use `aud_` prefix for shadow tables.

Example of the `orders` table:

| Column| Type| 
|--------------|--|
|`id`| `number`|
| `order_num` | `string`|
|`order_date`| `datetime`|
|`status`| `number`|

Our `aud_orders` table:


| Column| Type| 
|--------------|--|
|`aud_id` | `number` |
|`id`| `number` |
| `order_num` | `string`|
|`order_date`| `datetime`|
|`status`| `number`|
|`operation`| `string`|
|`operation_date`| `datetime`|
|`username`| `string`|

Here, `aud_id` column is the primary key for the `aud_orders` table, while
`id` is the copy of corresponding column from the `orders` table.

Now, let's say, we insert a new row into the `orders` table:

```foo
insert into orders(order_num, order_date, status)
values('12-g', 2022-01-01, 1)
```

This is how our tables will look after commiting this
operation:

*orders*:

|id|order_num|order_date|status|
|-|-|-|-|
|1|12-g|2022-01-01|1|

*aud_orders*:

|aud_id|id|order_num|order_date|status|operation|operation_date|username|
|-|-|-|-|-|-|-|-|
|`1`|`1`|`12-g`|`2022-01-01`|`1`|`I`|`2022-01-01 10:48:01`|`johndoe`|

Now, if we change some columns in this row:

```foo
update orders
set status = 2
where id = 1
```

Our `orders` table will look like this:

|id|order_num|order_date|status|
|-|-|-|-|
|`1`|`12-g`|`2022-01-01`|`2`|

And `aud_orders` table will get another one row:

|aud_id|id|order_num|order_date|status|operation|operation_date|username|
|-|-|-|-|-|-|-|-|
|`1`|`1`|`12-g`|`2022-01-01`|`1`|`I`|`2022-01-01 10:48:01`|`johndoe`|
|`2`|`1`|`12-g`|`2022-01-01`|`2`|`U`|`2022-01-01 10:52:01`|`johndoe`|

And later, if we will be asked for restore previous state of the row,
we can *easily* do this by fetching whole row data from the `aud_orders` table,
something like this: 

```foo
update orders o
set (o.order_date, o.order_num, o.order_status) = (
    select order_date, order_num, order_status
    from aud_orders ao
    where ao.aud_id = 1)
where id = 1
```

Since all columns in a shadow table have the same type as in the
audited table, we don't bother about type conversions and don't have to
remember all conventions as it would be if we were using some of the previous
audit solutions, where values are converted to strings. However, there are
some difficulties with getting the columns that were actually changed. To
do this, we  need to compare each column in both versions of a row and
fetch only those that have different values. Such task may be implemented
in plain SQL via analytic functions(`LAG`), or we can delegate this to
a client side, where it can be solved with the help of the general purpose
languages(javascript, java, C# etc).

When we delete our row, the `orders` table became empty, but the `aud_orders`
table will get another one row that represents the whole row right before
its deletion:

|aud_id|id|order_num|order_date|status|operation|operation_date|username|
|-|-|-|-|-|-|-|-|
|`1`|`1`|`12-g`|`2022-01-01`|`1`|`I`|`2022-01-01 10:48:01`|`johndoe`|
|`2`|`1`|`12-g`|`2022-01-01`|`2`|`U`|`2022-01-01 10:52:01`|`johndoe`|
|`3`|`1`|`12-g`|`2022-01-01`|`2`|`D`|`2022-01-02 08:13:28`|`admin`|

Therefore, it's easy to find out how our order looked at the moment of
deletion, and probably why it was deleted. Shadow tables also allow us
to list all changes for specific row in a table:

```foo
select *
from aud_orders
where id = 1
```

It looks very natural, like you work with the `orders` table
itself, and this is the most powerful and convenient feature of shadow
tables.

## Database-related features

Some databases have their own features for auditing, and
they should be preferred over any handmade solution. However,
if you feel that default audit capabilities are not enough,
feel free to implement your own system that will suit your
needs.

Here are some links:

- [Postgre log_statement param](https://postgresqlco.nf/doc/en/param/log_statement/)
- [Oracle Flashback data archive](https://docs.oracle.com/database/121/SQLRF/statements_5011.htm#SQLRF20008)
- [MySQL Enterprise Audit](https://www.mysql.com/products/enterprise/audit.html)

##  Should all changes be tracked?


Of course not. There is no need to keep an eye on every table
like the Big Brother, but it’s also quite hard
to say when to use audit and when not. Just “Listen to your soul”.

