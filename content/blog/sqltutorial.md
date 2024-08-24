---
title: "SQL tutorial "
date: 2021-11-24
toc: true
---

This is the small tutorial about SQL.
I hope it will help you to solve problems and make
it easy for you to understand SQL. 

**Note:** Work in progress. ☜(ﾟヮﾟ☜)

### Info for russian-speaking readers

There's also a book that was generated from one of my previous sites,
it's about SQL in Oracle database.

{% button "Download" "/static/book.pdf" "blue" %}

## What is SQL

SQL, or *Structure Query Language* is the main tool for interaction with
relational database management systems(RDBMS).

SQL is used to:

- Retrieve data from DB
- Save data to DB
- Perform changes in existing data

## SQL dialects

SQL is standardized, but who cares?

There are many RDBMS, and as a rule, each of them has its
differences in SQL implementation - some of them use different syntax for the same
things, some of them have or have not some features, but generally, if you
know one SQL dialect, it will be not so hard to switch to another dialect when
it will be needed.

In this tutorial, we will use SQLite database, since it's easy to install on most
platforms, and also it supports most of the standard SQL.

## SQL features

A few words about what is so special in SQL.

Unlike many other programming languages, such as Java, Pascal or JavaScript,
in which programming is performed by describing *how* to do things, in SQL we
need to describe *what* we need to do, or *what* result we want, but generally,
we can't tell the database how to achieve this result.

## Why learn SQL

As told, SQL is the main tool to talk with RDBMS.

When some program or service want to get, save or change data in a database,
it does this by using SQL. Even if SQL is not used directly, and for interaction
with the database some framework is used(such as Hibernate in Java), under the hood this
framework generates SQL, which is then passed to the database. 

## DML, DDL

SQL commands can be divided into two groups - *DML* and *DDL*.

Except for DML and DDL, there are also *DCL* and *TCL* groups, but we don't touch them in this tutorial.

DML stands for *Data Manipulation Language*. It consists of commands which can change **or retrieve  already existing data**.
By changing we mean also insertion of new data and deletion of old data.

So, here are the list of DML commands:

- SELECT
- INSERT
- UPDATE
- DELETE
- MERGE

Note that ``SELECT`` command also related to DML.

DDL is stands for *Data Definition Language*. It consists from commands which are responsible for database objects' creation or modification.

These commands are related to DDL:

- CREATE
- RENAME
- ALTER
- DROP
- RENAME
- TRUNCATE
- COMMENT

In this tutorial, we will mostly concentrate on DML commands, but we will use
DDL for creating our database schema.

## SQLite installation

### Linux

If you Llinux system, probably SQLite is already installed.

First, try to type into terminal following command:

```bash
sqlite3 -version
```

If you see something like this, SQLite is already installed:

```
3.31.1 2020-01-27 19:55:54 3bfa9cc97da10598521b342961df8f5f68c7388fa117345eeb516eaa837balt1
```

To install SQLite, we should search for `sqlite` package. Since there are so many
different Linux distributives and theirs package managers, it's hard to tell what exactly
command you need to type, but we will list instructions for most popular linux distrubutives.

#### Debian-based( Debian, Ubuntu, and others)

```bash
sudo apt-get install sqlite3
```

#### Fedora

```bash
sudo dnf install sqlite
```

#### Arch linux

```bash
sudo pacman -S sqlite
```

### Windows

You can download precompiled binaries from the official
[site](https://www.sqlite.org/download.html). Precompiled
binaries for Linux also can be downloaded from there.

## Tables

In RDMS data is stored in the tables. Tables are the key objects, with
which we have to work in SQL.

Tables in the databases don't differ much from the tables with which you
already familiar from school - they consist of *columns* and *rows*.
Each column in a table has its own name and type. Generally speaking,
there are five types of data that we can store in the database:

- Numbers
- Text
- Dates
- Binary data(images, pdf files and so on)
- Nothing

These types are not related to any concrete database engine. Moreover, many
databases have much more types, but those types don't bring any new kind of
data that we can store - they just split each of our types into more small
subtypes. For example, the Oracle database has a ``DATE`` type( accurate to seconds).
Also, it has the ``TIMESTAMP`` type, which is also used to store dates, 
but with more precision(accurate to parts of second).

**WTF is NULL?**

We need to pay attention to the last item on our list. What does it mean - Nothing?
We can think about it as just an empty column in a row. But the math
guy who have created relational theory did not like empty columns, and he said that
all columns must have a value. But in practice, we *need* empty columns sometimes,
so database developers have created a specific value which means that columns with
this value don't have a value. And this value is **NULL**. We will talk about
nulls later, don't worry, anything that we need to know for now is that this
value means *nothing*, *empty*, *no value* and so on.

## Database file creation

Let's create SQLite database which we will use to keep our
database structure for later use and experiments. In terminal,
type following command:

```
sqlite3
```

Right after this we will see something like this:

```
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.
sqlite> 
```

Wee see that now we are connected to *in-memory* database, what
means that if we quit from SQLite command prompt or shutdown the computer,
all our data will be lost. 

What we want is to save the database to a file so we can
use it later without losing our data. To do this, `.save` command is used:

```foo
sqlite> .save testdb.db
```

After execution of the above command, file named `testdb.db`
will be created in the current directory. 

To quit SQLite command interpreter, use `.quit` command.

## Creating test schema

Let's create our tables and fill them with test data.
We will use this schema throughout the whole SQL tutorial.

Our database structure represents an imaginary shop service, which allows
users to create some orders, put some items into those
orders and close them. Each order can be in one of the
next states: *Closed* and *Waiting*.

```foo
create table users(
    id number primary key,
	login text,
	is_active number
);

create table orders(
	id number primary key,
	user_id number,
	order_date text,
	order_num number,
	status number
);
	
create table items(
	id number,
	item_name text
);

create table order_items(
	id number,
	order_id number,
	item_id number,
	quantity number
);create table users(
    id number primary key,
	login text,
	is_active number
);


insert into users
values(1, 'JohnDoe', 1);

insert into users
values(2, 'MrWinner', 1);

insert into users
values(3, 'Alex', 1);

insert into users
values(4, 'Barbie', 1);

insert into users
values(5, 'Lisa', 1);

insert into users
values(6, 'Stone', 0);

create table items(
	id number primary key,
	item_name text,
	price number
);

insert into items
values(1, 'Microwave', 300);

insert into items
values(2, 'Mobile phone', 350);

insert into items
values(3, 'Nintendo switch', 400);

insert into items
values(4, 'TV', 1000);

insert into items
values(5, 'Laptop', 1500);

insert into items
values(6, 'Washer', 700);

create table orders(
	id number primary key,
	user_id number,
	order_date text,
	order_num number,
	status text,
	constraint orders_users_fk foreign key(user_id)
	    references users(id)
);

insert into orders
values(1, 2, '2021-10-11', 32, 'CLOSED');
	
insert into orders
values(2, 2, '2021-08-15', 230, 'WAITING');

insert into orders
values(3, 4, '2019-04-24', 39, 'CLOSED');

insert into orders
values(4, 5, '2019-04-24', 39, 'WAITING');

create table order_items(
	id number,
	order_id number,
	item_id number,
	quantity number,
	constraint order_items_order_fk foreign key(order_id)
	    references orders(id),
	constraint order_items_item_fk foreign key(item_id)
	    references items(id)
);


insert into order_items
values(1, 1, 4, 1);

insert into order_items
values(2, 1, 6, 1);

insert into order_items
values(3, 2, 5, 2);

insert into order_items
values(4, 3, 3, 4);

insert into order_items
values(5, 3, 2, 4);
```
Save this query to a file, named, for example, `schema.sql`.
Now, we need to open our database file:

```bash
sqlite3 testdb.db
```

To execute sql script, in SQLite command prompt, we need
to use command `read`:

```foo
sqlite> .read schema.sql
```

This command executes our script, but to be able to use
test data later, we need to save changes back to file:

```foo
sqlite> .save
```

Let's check which tables are in the database:

```foo
sqlite>.tables
```

Output:

```
items        order_items  orders       users 
```

So, now we have the database file, called `testdb.db`,
which contains tables with which we will work later.
In the next chapter we will look at how to retrieve
information from tables and how we can save it to external
file using SQLite command prompt. Now, take some time to relax;
here is a picture to help you do this:

![Relax image](/img/sqltut/relax_0.png)

## Summary

- SQL is the main language to talk with RDBMS
- SQL consists from DDL,  DML, DCL and TCL
- There are many SQL dialects
- `Null` is specific value that determines empty value
- To create new database file, we use command `sqlite3 dbfile.db`
- To execute a sql script, `.read sqlfile.sql` command is used
- To save changes back to file, `.save` command is used
- `.tables` command shows list of tables in the current database


In this chapter, we gonna look at how to retrieve data
from the database.

## First select

Let's connect to our database, which we have created previously:


```bash
sqlite3 testdb.db
```

To select data from database tables, `SELECT` command is used.
It is probably the most frequently usable command in SQL, and we will use
this command all the time.

Let's see what data we have in the `users` table:

```foo
sqlite> select *
   ...> from users;
```

Result:

```
1|JohnDoe|1
2|MrWinner|1
3|Alex|1
4|Barbie|1
5|Lisa|1
6|Stone|0
```

Here we have just ran our first SQL query, which retrieves all data
from the `users` table. One important thing - a sql query is executed
after the first semicolon.

Ok, we have some results, but they look very ugly. We can't see table
columns, and here is no any formatting. Before we dive into the
structure of `SELECT` query, let's tweak SQLite command prompt, so
that query results will look more sexy.

## Sqlite prompt configuration

We gonna add options for displaying column headers and for
aligning columns content. To do this,  we need to create
a file named `.sqliterc` in the home directory with the following content:

```
.headers on
.mode column
```

Now, if we run our query again, result will look much better:

```
id          login       is_active 
----------  ----------  ----------
1           JohnDoe     1         
2           MrWinner    1         
3           Alex        1         
4           Barbie      1         
5           Lisa        1         
6           Stone       0
```

## Select query basics

We have ran next query:

```foo
select *
from users
```

In this query we have just said: "Database, please,
give me all rows and all columns from the `users` table.

In select queries, asterisk means "All columns". If we want
to retrieve some specific columns, we need to list them. Let's get
only login names:

```foo
select login
from users
```

If we want to select a few columns, they should be separated by
comma:

```foo
select login, is_active
from users
```

## Table aliases

It is a good practice to use aliases in SQL queries.
By using table aliases, we can say from which table
column should be used. Table aliases are separated
by space from the table name:

```foo
select u.login, u.is_active
from users u
```

Now it may look like as a redundant thing, but in complex
cases, table aliases make queries much, much more readable.

Table names also can be used as aliases, so if the table name
is short, it is ok to use it as an alias:

```foo
select users.login, users.is_active
from users
```

## Column aliases

Aliases can be given for selected columns, too:

```foo
select u.login user_login,
       u.is_active is_active_flag
from users
```

And now our query result looks like there are
`users_login` and `is_active_flag` in
the `users` table:

```
user_login  is_active_flag
----------  --------------
JohnDoe     1             
MrWinner    1             
Alex        1             
Barbie      1             
Lisa        1             
Stone       0             
```

## Rows filtering

Almost always we don't need all data in a table, we want to
get rows that satisfy some conditions. For example, we may want
only active users, only inactive users, users which logins start with
the symbol 'A' and so on.

In SQL, we specify conditions in the `WHERE` clause:

```foo
select u.*
from users u
where u.is_active = 1
```

```
id          login       is_active 
----------  ----------  ----------
1           JohnDoe     1         
2           MrWinner    1         
3           Alex        1         
4           Barbie      1         
5           Lisa        1         
```

Here we have got only active users.

When using `WHERE`, only those rows go to the result, which
satisfy all conditions.


In the `WHERE` clause, we can specify multiple conditions by using
`AND` and `OR` keywords.

Let's get information about users with nicknames "MrWinner" and "Lisa":

```foo
select u.*
from users u
where u.login = 'MrWinner'
or u.login = 'Lisa'
```

```
id          login       is_active 
----------  ----------  ----------
2           MrWinner    1         
5           Lisa        1         
```

We have used `OR` to include both rows in the result.

If we use `AND`, the result will be empty:

```foo
select u.*
from users u
where u.login = 'MrWinner'
and u.login = 'Lisa'
```

That is because there are no rows in the table which
have values "MrWinner" and "Lisa" at the same time.

### Grouping conditions

Let's remember school math: things between brackets are
calculated first. Same thing with conditions in SQL
(actually, it is  boolean logic and predicate calculations,
but it's boring):


```foo
select u.*
from users u
where (is_active = 0 or login = 'Lisa') and is_active = 1
```

Result:

```
id          login       is_active 
----------  ----------  ----------
5           Lisa        1         
```

If we change brackets position, the result will be different:

```foo
select u.*
from users u
where is_active = 0 or (login = 'Lisa' and is_active = 1)
```

Result:

```
id          login       is_active 
----------  ----------  ----------
5           Lisa        1         
6           Stone       0         
```

## Export data to CSV

This topic is exclusively about the SQLite database feature.
It allows you to save query results into a CSV file.

Here is the how-to:

1. Turn on CSV mode:

    ```
    sqlite> .mode csv
    ```

2. Set output file:

    ```
    sqlite> .output result.csv
    ```

    Here `result.csv` is the output file. It can has
    any other name.

3. Execute query:

    ```foo
    qlite> select *
       ...> from users;
    ```

Our result csv file now contains:

```
id,login,is_active
1,JohnDoe,1
2,MrWinner,1
3,Alex,1
4,Barbie,1
5,Lisa,1
6,Stone,0
```

Additional info about command-line features of SQLite
can be found at [Official docs](https://www.sqlite.org/cli.html).

## Summary

- To filter query results, WHERE clause is used
- To change the default calculation order, we can use brackets
  for grouping conditions
- In SQLite, it is easy to export data into a CSV file

Sometimes we want to get result in specific order,
and `order by` clause does exactly this.

## Basic sorting

Let's look at the data in the `orders` table:

```foo
select user_id, order_date, order_num
from orders
```

```
user_id     order_date  order_num 
----------  ----------  ----------
2           2021-10-11  32
2           2021-08-15  230
4           2019-04-24  39
5           2019-04-24  39 
```

We can retrieve orders info sorted by the `order_num` column:

```foo
select user_id, order_date, order_num
from orders
order by order_num asc
```

Result:

```
user_id     order_date  order_num 
----------  ----------  ----------
2           2021-10-11  32
4           2019-04-24  39
5           2019-04-24  39
2           2021-08-15  230 
```

As we can see, now orders are sorted by order number in
ascending order. This is because we have set *ascending*
order in the `order by` by adding the `asc` keyword.

It's unnecessary to add `asc` if we want to sort rows in
ascending order - it is the default. Next query
is identical to the previous one:

```foo
select user_id, order_date, order_num
from orders
order by order_num
```

To sort rows in descending order, we should add
`desc` to `order by` clause:

```foo
select user_id, order_date, order_num
from orders
order by order_num desc
```

```
user_id     order_date  order_num 
----------  ----------  ----------
2           2021-08-15  230
4           2019-04-24  39 
5           2019-04-24  39 
2           2021-10-11  32
```

## Sorting by multiple columns

To sort rows by multiple columns, those columns
should be separated by commas:

```foo
select user_id, order_date, order_num
from orders
order by user_id desc, order_date
```

```
user_id     order_date  order_num 
----------  ----------  ----------
5           2019-04-24  39
4           2019-04-24  39
2           2021-08-15  230
2           2021-10-11  32 
```

Here rows come sorted by `userId` in descending order
first, and by order date in ascending order second.
It is observed by the fact that rows with the same
`user_id`(where it equals to 2) sorted by `order_date`
in ascending order.

## Sorting's voodoo techniques

It is unnecessary for a column to be included into a
select query - we can sort by column, but don't
select it at all:

```foo
select order_date, order_num, status
from orders
order by user_id desc
```

```
order_date  order_num   status 
----------  ----------  ----------
2019-04-24  39          WAITING 
2019-04-24  39          CLOSED
2021-10-11  32          CLOSED 
2021-08-15  230         WAITING
```

Rows are sorted by the `user_id` column, as in the
previous example, but the `user_id` column itself does not
exist in the result set.

We can sort columns by their order in `select` clause, not just
by their name:

```foo
select user_id, order_date, order_num, status
from orders
order by 1, 2 desc
```

```
user_id     order_date  order_num   status
----------  ----------  ----------  ----------
2           2021-10-11  32          CLOSED 
2           2021-08-15  230         WAITING
4           2019-04-24  39          CLOSED 
5           2019-04-24  39          WAITING
```

The above query is the same as the next one:

```foo
select user_id, order_date, order_num, status
from orders
order by user_id, order_date desc
```

Such a feature can look attractive, but in practice you
**should avoid sorting by columns' order**, because
such queries may become invalid after changing column
order. Let's demonstrate this.

Suppose we have a query:

```foo
select order_date, order_num, status
from orders
order by 1, 2 desc
```

```
order_date  order_num   status 
----------  ----------  ----------
2019-04-24  39          CLOSED 
2019-04-24  39          WAITING
2021-08-15  230         WAITING
2021-10-11  32          CLOSED 
```

But some time later we decide to retrieve the `user_id`
column as well:

```foo
select user_id, order_date, order_num, status
from orders
order by 1, 2 desc
```

```
user_id     order_date  order_num   status
----------  ----------  ----------  ----------
2           2021-10-11  32          CLOSED
2           2021-08-15  230         WAITING
4           2019-04-24  39          CLOSED
5           2019-04-24  39          WAITING 
```

Now rows come in an absolutely different order, because
the `user_id` column is first and the `order_date` is
second.

## Summary

- `Order by` clause is used for result sorting. 
- There is no need to add `asc` keyword to sort rows in
  ascending order - this value is assumed to be the default.
- It is the bad pattern to order rows by specifying columns
  order - it is better to list columns by their names.

  Joins are some of the most essential concepts of SQL.
They are used for querying data from multiple tables. In
this article we will look at `JOIN` and `LEFT/RIGHT JOIN` -
these are all what you need to know to freely work with multiple
tables.

## LEFT JOIN

Let's forget about tables and databases for a while, and imagine that
we have two bags with balls of various colors. Also, let's imagine that
one bag is placed on the left side and another bag is placed on the right
side relating to us.

Now, let's play the very simple game - we will take one random ball
from the left bag and then we will search for all balls with the same
colour in this bag. Then we search for balls with this colour in the
right bag. We can write down this operation like "Find all balls of color C
in bag A, and then find all balls of color C in bag B".

In SQL, we could write a query for this:

```foo
-- Search for Red balls
select ball, colour
from A
left join B on B.colour = A.colour
where A.colur = 'Red'
```

We will dig deeper into examples from our test database a
little bit later.

If we modify the rules a little and will take all balls from the left bag
and search for all balls from the right bag with the same colour as the
balls from the left bag, then
we should remove the filter condition from our query:

```foo
select ball, colour
from A
left join B on B.colour = A.colour
```

What if we will not find any balls in the right bag, which colours
match with the balls from the left bag? In this case, our result row
set will contain only balls from the left bag. This is the
only thing that makes `JOIN` and `LEFT` or `RIGHT JOIN` different.

For a concrete example, suppose we are gonna fetch info about all orders.
We have the `orders` table, which contains info about orders,
but we also want to see what items were in each order, and this
info is stored in the `order_items` table.

First, let's see what data lies in each of these tables:

Orders:

```foo
select *
from orders
```

```
id          user_id     order_date  order_num   status
----------  ----------  ----------  ----------  ----------
1           2           2021-10-11  32          CLOSED
2           2           2021-08-15  230         WAITING
3           4           2019-04-24  39          CLOSED
4           5           2019-04-24  39          WAITING
```

Order_items:

```foo
select *
from order_items
```

```
id          order_id    item_id     quantity
----------  ----------  ----------  ----------
1           1           4           1
2           1           6           1
3           2           5           2
4           3           3           4
5           3           2           4
```

To query data from both tables, we need to pick a
condition by which these tables will be joined(
like balls colors).

Here we can(and need, actually) to use order id -
`order_id` column  in the `order_items` table
is linked to the `id` column in the `orders` table.
Such relation has a corresponding specific object
in databases, called "foreign key".

So, here is our query:

```foo
select o.id, o.order_date, o.order_num, i.quantity
from orders o
left join order_items i on i.order_id = o.id
```

```
id          order_date  order_num   quantity
----------  ----------  ----------  ----------
1           2021-10-11  32          1
1           2021-10-11  32          1
2           2021-08-15  230         2
3           2019-04-24  39          4
3           2019-04-24  39          4
4           2019-04-24  39
```

Now let's talk about this query in more detail.
We take all rows from the `orders` table, and then,
for every row, we take all rows from the `order_items`
table with the same value in the `order_id` column.
For the order with id = 4, we did not find any rows in the
`order_items` table, so there is no value in the `quantity`
field for this row.


## RIGHT JOIN

If we will take balls from the right bag first and then search
for similar colours in the left bag, this will be called `RIGHT JOIN`
operation.

## JOIN

As was said, JOIN is the operation that leaves only
those rows which exist in both tables. Let's
get all user orders:

```foo
select u.id, u.login, o.order_date, o.status
from users u
join orders o on o.user_id = u.id
```

Result:

```
id          login       order_date  status
----------  ----------  ----------  ----------
2           MrWinner    2021-10-11  CLOSED
2           MrWinner    2021-08-15  WAITING
4           Barbie      2019-04-24  CLOSED
5           Lisa        2019-04-24  WAITING
```

Note that users with id = 1 and 2 did not appear
in a result, because they do not have any orders.

Or, let's rewrite the example from
the `LEFT JOIN` part, but this time we will
use `JOIN`:

```foo
select o.id, o.order_date, o.order_num, i.quantity
from orders o
join order_items i on i.order_id = o.id
```

Result:

```
id          order_date  order_num   quantity
----------  ----------  ----------  ----------
1           2021-10-11  32          1
1           2021-10-11  32          1
2           2021-08-15  230         2
3           2019-04-24  39          4
3           2019-04-24  39          4
```

Row with empty quantity disappeared, because there is no
such row in the `order_items` table, where `order_id` is equal 4.

## Using joins with more than two tables

When we want to join more than two tables, we just
apply join rules for the first two tables first, then we
join result of this join with third table then result
is joined with the fourth table and so on.


```foo
select u.id,
       u.login,
       o.order_date,
       i.item_name,
       oi.quantity
from users u
join orders o on o.user_id = u.id
left join order_items oi on oi.order_id = o.id
left join items i on i.id = oi.item_id
where u.is_active = 1
```

Result:

```
id          login       order_date  item_name   quantity
----------  ----------  ----------  ----------  ----------
2           MrWinner    2021-10-11  TV          1
2           MrWinner    2021-10-11  Washer      1
2           MrWinner    2021-08-15  Laptop      2
4           Barbie      2019-04-24  Mobile pho  4
4           Barbie      2019-04-24  Nintendo s  4
5           Lisa        2019-04-24
```

Here, the `users` table first joined with
the `orders` table first.
We can see what we have after this join:

```foo
select u.id, u.login, o.order_date
from users u
join orders o on o.user_id = u.id
```

```
id          login       order_date
----------  ----------  ----------
2           MrWinner    2021-10-11
2           MrWinner    2021-08-15
4           Barbie      2019-04-24
5           Lisa        2019-04-24
```

We see, that MrWinner has two orders
(different dates, and  also different
order_id values), Barbie and Lisa both have one
order.

**Important notice**: when joins are performed,
all columns from both tables are available
for later use in a query. They don't have
to appear in the selected columns list. In our query,
for example, we used the `is_active` column from the `users`
table in the `where` clause, but the column itself did
not appear in a result set.

Next, we are
`jeft join`ing this result with the
`order_items` table:

```foo
select u.id, u.login, o.order_date, oi.quantity
from users u
join orders o on o.user_id = u.id
left join order_items oi on oi.order_id = o.id
```

```
id          login       order_date  quantity
----------  ----------  ----------  ----------
2           MrWinner    2021-10-11  1
2           MrWinner    2021-10-11  1
2           MrWinner    2021-08-15  2
4           Barbie      2019-04-24  4
4           Barbie      2019-04-24  4
5           Lisa        2019-04-24
```

Take a look at the row with user `Lisa` - it does not
have a value in the `quantity` column. This is because there are
no items in her order. And since we use `left join`, rows
that have been produced by previous joins did not disappear.

Just to see the difference, we can rewrite this query
using `join` instead of `left join`:

```foo
select u.id, u.login, o.order_date, oi.quantity
from users u
join orders o on o.user_id = u.id
join order_items oi on oi.order_id = o.id
```

```
id          login       order_date  quantity
----------  ----------  ----------  ----------
2           MrWinner    2021-10-11  1
2           MrWinner    2021-10-11  1
2           MrWinner    2021-08-15  2
4           Barbie      2019-04-24  4
4           Barbie      2019-04-24  4
```

Here, rows, which do not have order items, have
been removed from the result set.

But let's go back to our main example. The last
join is with the `items` table, from which we select
item names.

The final part is not join, but filtering
(`where u.is_active = 1`) - we keep
only those rows, which have "1" as value of
the `users.is_active` column (actually,
no rows were removed at this step, because all
users in result set is active).


## Using subqueries

Instead tables, we can use subqueries in any JOIN clause
(It applies not only to joins - in SQL you can use subqueries almost
everywhere where tables can be used).

```foo
select u.login,
       ord.order_date,
       ord.order_num,
       ord.item_name
from users u
left join (
       select o.user_id,
              o.order_date,
              o.order_num,
              oi.quantity,
              i.item_name,
              i.price
       from orders o
       join order_items oi on oi.order_id = o.id
       left join items i on i.id = oi.item_id
       where o.status = 'CLOSED'
) ord on ord.user_id = u.id
```

Result:

```
login       order_date  order_num   item_name 
----------  ----------  ----------  ----------
JohnDoe                                       
MrWinner    2021-10-11  32          TV        
MrWinner    2021-10-11  32          Washer    
Alex                                          
Barbie      2019-04-24  39          Mobile pho
Barbie      2019-04-24  39          Nintendo s
Lisa                                          
Stone                                         
```

Subqueries did not explained in this tutorial yet, but
here it should be clear - we wrap some query in parens,
assign alias name to it(`ord` in our case), and use it
like it is a table.

**Tip**: Select only those columns in subqueries, which
will be used later. Here, we did not use item price column
(`i.price`),
so it *must* be removed. Unnecessary columns, joins and conditions
in subqueries make queries more complicated and harder
to read later, especially for other people.


## More on conditions in joins

## Compound conditions

We can use compound conditions by
which we are going to join tables:

```foo
select u.login, o.order_num, o.status
from users u
left join orders o on o.user_id = u.id and o.status = 'CLOSED'
```

Result:

```
login       order_num   status    
----------  ----------  ----------
JohnDoe                           
MrWinner    32          CLOSED    
Alex                              
Barbie      39          CLOSED    
Lisa                              
Stone                             
```

Here, only those rows from the `orders` table are
attached to rows from the
`users` table, where not only `user_id` has matched rows, but
also rows that have status 'CLOSED'. 

Be careful here - it is the join condition, and it affects
only on joined rows - not on a whole result. Compare query
above with this one and see the difference:

```foo
select u.login, o.order_num, o.status
from users u
left join orders o on o.user_id = u.id
where o.status = 'CLOSED'
```

Result:

```
login       order_num   status    
----------  ----------  ----------
MrWinner    32          CLOSED    
Barbie      39          CLOSED    
```

Conditions in a `where` clause are applied to
a whole dataset which is result of all joins 
in a query.

## You can use any condition you want

You don't have to join by `id` columns or
something like that. Yes, *usually*, joins
are performed by linking rows in one set to rows
in another set by matching some columns, but it is not
necessary. Join conditions are like all other conditions
in SQL - they are just a rule, or set of rules,
which can be evaluated to true or false, and nothing more.

For example: 

```foo
select u.id, u.login, o.user_id, o.order_num
from users u
join orders o on (1 = 1)
```

Boom:

```
id          login       user_id     order_num 
----------  ----------  ----------  ----------
1           JohnDoe     2           32        
1           JohnDoe     2           230       
1           JohnDoe     4           39        
1           JohnDoe     5           39        
2           MrWinner    2           32        
2           MrWinner    2           230       
2           MrWinner    4           39        
2           MrWinner    5           39        
3           Alex        2           32        
3           Alex        2           230       
3           Alex        4           39        
3           Alex        5           39        
4           Barbie      2           32        
4           Barbie      2           230       
4           Barbie      4           39        
4           Barbie      5           39        
5           Lisa        2           32        
5           Lisa        2           230       
5           Lisa        4           39        
5           Lisa        5           39        
6           Stone       2           32        
6           Stone       2           230       
6           Stone       4           39        
6           Stone       5           39    
```

This is called "Decart multiplication", or "cartesian
product".

Here, for each row in the `users` table, join
condition is evaluated to True for all rows
in the `orders` table. In SQL, there is special
syntax for such kind of joins - `CROSS JOIN`. Next
query is identical to the previous one:

```foo
select u.id, u.login, o.user_id, o.order_num
from users u
cross join orders o
```

## Summary

- Joins allow us to query data from multiple tables
- We can join subqueries
- Join conditions can be complex

## UNION, EXCEPT, INTERSECT

In this chapter, we will look at so-called Set operators,
which work with the datasets returned by two queries.

To make examples more understandable, we will create the 
``guest_orders`` table, which will store orders that were
placed by guest users. 

Our first step is to open our ``testdb.db`` file:

```
sqlite3 testdb.db
```

Then, we need to run this query:

```foo
create table guest_orders(
    login text,
    order_date text,
    order_num,
    status text
);

insert into guest_orders
values('Anonymous', '2021-11-04', '238', 'CLOSED');

insert into guest_orders
values('JohnDoe', '2021-11-04', '239', 'CLOSED');

insert into guest_orders
values('JohnDoe', '2021-11-19', '254', 'WAITING');

insert into guest_orders
values('Alex', '2021-12-14', '283', 'WAITING');

insert into guest_orders
values('Stone', '2021-12-14', '290', 'CLOSED');
```

That is it. No further actions are required. When we open
the ``testdb.db`` file again, it will already contain this
table.

### UNION

Let's say we want to do some analytic research, and for this,
we need the logins of all users who have placed the orders
(without taking into account order statuses).

We already can get all logins of guest users:

```foo
select login
from guest_orders;
```

```
login    
---------
Anonymous
JohnDoe  
JohnDoe  
Alex     
Stone
```

As all logins of the registered users that
specified in the ``orders`` table:

```foo
select u.login
from orders o
join users u on u.id = o.user_id;
```
```
login   
--------
MrWinner
MrWinner
Barbie  
Lisa    
```

The ``UNION`` operator combines results from two queries and 
removes any duplicate rows so that each row in the result
set is unique:

```foo
select login
from guest_orders

UNION

select u.login
from users u
join orders o on o.user_id = u.id
```

Result:

```
login    
---------
Alex     
Anonymous
Barbie   
JohnDoe  
Lisa     
MrWinner 
Stone    
```

It will be easier to understand how the ``UNION`` operator works
if we run each query separately:


**First query:**

```foo
select login
from guest_orders
```

```
login    
---------
Anonymous
JohnDoe  
JohnDoe  
Alex     
Stone    
```

**Second query:**

```foo
select u.login
from users u
join orders o on o.user_id = u.id
```

```
login   
--------
MrWinner
MrWinner
Barbie  
Lisa  
```

If we mix all logins, we will get this:

```
Anonymous
JohnDoe  
JohnDoe  
Alex     
Stone    
MrWinner
MrWinner
Barbie  
Lisa  
```

Now, if we remove all duplicate rows, we will 
get the original result. This is how the ``UNION``
operator works - getting all data and removing all duplicates,
nothing complicated.

Now, get prepared for the main rule of all set operators: **each
query must return the same number of columns**:

```foo
select item_name, id
from items

UNION

select item_id
from order_items;
```

We will get the error message from SQLite:
``Error: SELECTs to the left and right of UNION do not have the same number of result columns``.
There is no need for any explanations, I think.

#### UNION ALL

The ``UNION ALL`` operator works like the ``UNION`` operator,
except that it doesn't remove duplicates:

```foo
select login
from guest_orders

UNION ALL

select u.login
from users u
join orders o on o.user_id = u.id
```

Result:

```
Anonymous
JohnDoe  
JohnDoe  
Alex     
Stone    
MrWinner
MrWinner
Barbie  
Lisa  
```

**Info**: If you know that there are no
duplicates in both queries, use the ``UNION ALL`` operator,
so that a database will not spend time removing them.

### EXCEPT

Let's get the items that don't appear in any order:

```foo
select id
from items

except

select item_id
from order_items;
```

Result:

```
id
--
1 
```

Yeah, just one item. Anyway, the ``EXCEPT`` operator returns
*unique* rows from the first query, which don't exist in
the second query.

The ``Except`` operator works with two datasets, which are select queries.
They can be both simple queries, as in our example, and very
complex ones, but they are always just the select queries, nothing more.

What a developer must care about is the columns' order.
It may turn out that in some query he implied one
meaning for the column, while in the second query
he did a mistake and specified a column with a completely different sense for the
same position. Such a situation is worse than an exception, because
it's easy to miss wrong results, and it's just the time bomb.

Let's demonstrate such a situation. 
Suppose we want to get all users that haven't created any order,
and we write this query:

```foo
select id, login
from users
except
select o.id, u.login
from orders o
join users u on u.id = o.user_id;
```

Result:

```
id  login  
--  -------
1   JohnDoe
3   Alex   
4   Barbie 
5   Lisa   
6   Stone  
```

Looks good, but it is the incorrect result.
The problem here is that in the second query we fetch
order id, while we need to get user id. Since both are
numbers, it is easy to interpret this result as the
right one.

This is the corrected query:

```foo
select id, login
from users
except
select o.user_id, u.login
from orders o
join users u on u.id = o.user_id;
```

Result:

```
id  login  
--  -------
1   JohnDoe
3   Alex   
6   Stone 
```

### INTERSECT

The ``INTERSECT`` operator is reversed ``EXCEPT``:
It returns *unique* (as all set operators) rows that both exist in the first and
the second query.

The following SQL statement returns the logins that appear both in the
``guest_orders`` and ``users`` tables:

```foo
select login
from guest_orders

intersect

select login
from users;
```

Result:

```
login
-------
Alex
JohnDoe
Stone
```

## Subqueries

Subqueries are just the SQL queries that are parts
of another SQL query. 

### Subqueries in a select clause

We can wrap any query in parentheses and put it
in a `select` list alongside with ordinary columns:

```foo
select id,
       order_date,
       (select sum(quantity) from order_items) items_cnt
from orders o;
```

Note that subqueries that are placed in a select clause should
return only *one row and one column or return no data
at all*. The next query is illegal:

```foo
select id,
       order_date,
       (select oi.order_item, oi.id from order_items oi) items_cnt
from orders o;
```

### Correlated subqueries

Correlated subqueries are the queries that use
data from external (relating to them) queries:

```foo
select id,
       order_date,
       (select sum(i.quantity) from order_items i where i.order_id = o.id) items_cnt
from orders o;
```

Result:

```foo
id  order_date  items_cnt
--  ----------  ---------
1   2021-10-11  2        
2   2021-08-15  2        
3   2019-04-24  8        
4   2019-04-24          
```

For each fetched row from the `orders` table, the subquery
is executed, and every time it will use the value
of `o.id` column, which it takes from the "outer" query.

### Subqueries as tables

We can use subqueries anywhere in a `SELECT` query where
we can use tables. For example:

```foo
select o.id,
       i.item_name,
       ord_items.quantity
from orders o
join (
    select oi.order_id,
           oi.item_id,
           oi.quantity
    from order_items oi
    where quantity >= 2
) ord_items on ord_items.order_id = o.id
join items i on i.id = ord_items.item_id
```

Result:


```foo
id  item_name        quantity
--  ---------------  --------
2   Laptop           2       
3   Nintendo switch  4       
3   Mobile phone     4    
```

In the example above, we have joined the `orders` table with
the subquery instead of a table. Then, we treat its data like
if it's contained in a some table with  the `ord_items` alias.

Here is another example, where we use a subquery as a single
source of data:

```foo
select a.*
from (
    select *
    from items
) a
where a.price < 500
```

Result:

```foo
id  item_name        price
--  ---------------  -----
1   Microwave        300  
2   Mobile phone     350  
3   Nintendo switch  400
```

Applying all above rules we can nest one subquery into another:

```foo
select id,
       order_date,
       status,
       login,
       qty
from (
select ord_info.id,
       ord_info.order_date,
       ord_info.status,
       ord_info.login,
       (
           select sum(oi.quantity)
           from order_items oi
           where oi.order_id = ord_info.id
       ) qty
from (
    select o.id, o.order_date, o.status, u.login
    from orders o
    join users u on u.id = o.user_id
) ord_info
) summary;
```

Result:

```foo
id  order_date  status   login     qty
--  ----------  -------  --------  ---
1   2021-10-11  CLOSED   MrWinner  2  
2   2021-08-15  WAITING  MrWinner  2  
3   2019-04-24  CLOSED   Barbie    8  
4   2019-04-24  WAITING  Lisa  
```

Here we have used the correlated subquery to get items quantity for each order, while data about orders has been obtained by joining two tables - `orders` and `users` (and this join has been performed in the subquery). Then, we have wrapped the whole query into one single subquery and have used it like it's a table. Logically, we can imagine the query above like the next one:

```foo
select id,
       order_date,
       status,
       login,
       qty
from summary;
```

Where the `summary` table is our big outer subquery:

```foo
select ord_info.id,
       ord_info.order_date,
       ord_info.status,
       ord_info.login,
       (
           select sum(oi.quantity)
           from order_items oi
           where oi.order_id = ord_info.id
       ) qty
from orders_info ord_info
```

While the `orders_info` table can be disassembled into this:

```foo
select o.id, o.order_date, o.status, u.login
from orders o
join users u on u.id = o.user_id
```

Thus, subqueries can be used as build blocks for a more complex query, making it easy to write and understand.
