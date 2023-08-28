---
title: "Views"
date: 2021-12-27
---

## What are views

Views are objects in a database, which:

1. Look like a table
2. Contain inside themselves a SQL query, by which a view is replaced when it's
   used.

Views work like tables in many ways. We can (with some restrictions)
insert, update and delete data from them.

## Creating views

General syntax is:

```
create view viewname as
select ...
...
...;
```

It means that a SQL query with needed data is enough for view creation.
We can create views with `or replace` option, and then, if the view with
such name already exists, it will be overwritten.

```
create or replace view viewname as
select ...
...
...;
```

Let's create tables for employees, posts and departments:

```
create table employees(
id number,
emp_name varchar2(100 char),
dept_id number,
position_id number
);

create table departments(
id number,
dept_name varchar2(100)
);

create table positions(
id number,
position_name varchar2(100)
);

insert into departments values(1, 'IT');
insert into departments values(2, 'SALARY');
insert into positions values(1, 'MANAGER');
insert into positions values(2, 'CLERK');
insert into employees values(1, 'Ivan Boika', 1, 1);
insert into employees values(2, 'John Rosenshteiner', 1, 2);
insert into employees values(3, 'Philipp Dauhn', 2, 1);
insert into employees values(4, 'Sid Vicious', 2, 2);
```

Now, let's create a `vemployees` view, which will contain data about
employees from all these tables in a "joined" state:

```
create view vemployees as
select e.id,
e.emp_name,
d.dept_name,
p.position_name
from employees e
join departments d on d.id = e.dept_id
join positions p on p.id = e.position_id;

comment on table vemployees is 'employees';
comment on column vemployees.id is 'employee id';
comment on column vemployees.emp_name is 'employee name';
comment on column vemployees.dept_name is 'department';
comment on column vemployees.position_name is 'position';
```

Note that views and their columns may contain comments like
ordinary tables in Oracle.

Now, to get interested data, we don't have to write SQL query
again, it's enough to get it from the view:

```
select *
from vemployees
```

```
+----+--------------------+-----------+---------------+
| ID |      EMP_NAME      | DEPT_NAME | POSITION_NAME |
+----+--------------------+-----------+---------------+
|  1 | Ivan Boika         | IT        | MANAGER       |
|  3 | Philipp Dauhn      | SALARY    | MANAGER       |
|  2 | John Rosenshteiner | IT        | CLERK         |
|  4 | Sid Vicious        | SALARY    | CLERK         |
+----+--------------------+-----------+---------------+
```

We can use existing views to create other views:

```
create view vemployees_it as
select a.*
from vemployees a
where a.dept_name = 'IT';
```

We should carefully use existing views as build blocks for new ones.
It may turn out that it's better to write completely new SQL query which
is more optimal for specific task.

## * Symbol

When Oracle meets `*` in a view's definition, it replaces an asterics
with the list of columns returned by the query. It means that if
a new column is added to some table, Oracle won't add it to the view.
It's pretty easy to check:


```
create table tst(
n1 number,
n2 number
);

insert into tst values(1, 2);

create view v_tst as
select *
from tst;
```

Let's see what data is in the view:

```
select *
from v_tst
```

```
+----+----+
| N1 | N2 |
+----+----+
|  1 |  2 |
+----+----+
```

Now let's add a column to the `tst` table:

```
alter table tst
add (n3 number);
```

If we look at the view, we will see that column's list
hasn't changed:

```
+----+----+
| N1 | N2 |
+----+----+
|  1 |  2 |
+----+----+
```

To add the `n3` column to the view, we can change it by adding this
column to the columns list, or recreate the view again (with `create or replace`):

```
create or replace view v_tst as
select *
from tst
```

## Modify view data

Tables that are used in a view are called "base tables".
Views that are created from one base table can be changed like an ordinary table.
For example, let's create `vdepartments` view and add some rows to it.

```
-- Create a view
create view vdepartments as
select id, dept_name
from departments;

-- Insert row through the view, not through a table
insert into vdepartments(id, dept_name)
values(10, 'SALES');
```

Of course, a row is inserted into a base table ( the `department` table
in this case).

We can also delete and update rows in a base table:

```
delete from vdepartments
where id = 10;

update vdepartments
set dept_name = 'SECURITY'
where id = 1;
```

Let's look at the view:

```
select *
from vdepartments
```

Result:

```
+----+-----------+
| ID | DEPT_NAME |
+----+-----------+
|  1 | SECURITY  |
|  2 | SALARY    |
+----+-----------+
```

## Views with check option

We can create view which will restrict data changing  in
base tables. `WITH CHECK OPTION` option is used for this during
view creation.

Let's create a view with managers only:

```
create view vemp_managers as
select *
from employees
where position_id = 1
```

This view contains only managers, but it doesn't mean that
we can't insert into it employees with a different position:

```
-- Add an employee with position_id = 2
insert into vemp_managers(id, emp_name, dept_id, position_id)
values(10, 'John Doe', 1, 2);
```

After that, the view looks the same:

```
select *
from vemp_managers
```

```
+----+---------------+---------+-------------+
| ID |   EMP_NAME    | DEPT_ID | POSITION_ID |
+----+---------------+---------+-------------+
|  1 | Ivan Boika    |       1 |           1 |
|  3 | Philipp Dauhn |       2 |           1 |
+----+---------------+---------+-------------+
```

But the `employees` table itself now has new rows:

```
select *
from employees
```

```
+----+--------------------+---------+-------------+
| ID |      EMP_NAME      | DEPT_ID | POSITION_ID |
+----+--------------------+---------+-------------+
| 10 | John Doe           |       1 |           2 |
|  1 | Ivan Boika         |       1 |           1 |
|  2 | John Rosenshteiner |       1 |           2 |
|  3 | Philipp Dauhn      |       2 |           1 |
|  4 | Sid Vicious        |       2 |           2 |
+----+--------------------+---------+-------------+
```

In order to be able to modify only rows that a view has, `with check option`
option is used. Let's try this way:

```
create or replace view vemp_managers as
select *
from employees
where position_id = 1
with check option;

insert into vemp_managers(id, emp_name, dept_id, position_id)
values(11, 'John Doe', 1, 2);
```

We'll get the `view WITH CHECK OPTION where-clause violation`
exception if we run example above.

## Modify views that are made up of multiple tables

In Oracle, we can change data via views that are
made up of multiple tables, but with some restrictions:

1. It's possible to change only one base table
2. Affected table should be a "key preserved table".

The last point is the most important for understanding whether
data can be changed  in a multi-table view or not. So, a table is key preserved,
if each of its rows has at most one row in a view.

It should be remembered that key preserved property doesn't depend
on data, but rather on tables' structure and relations between them.
In fact, data in a view may look like that for one row in a
base table there's one row in the view. But it doesn't mean
that this property will not be changed after data modifications in
tables inside the view.

For demonstration, we're going to create a `vemp_depts` view, which
will contain information about employees and their departments:

```
create or replace view vemp_depts as
select e.id,
       e.emp_name,
       e.dept_id,
       e.position_id,
       d.id department_id,
       d.dept_name
from employees e
join departments d on e.dept_id = d.id
```

Let's see what's inside this view:

```
select *
from vemp_depts
```

```
+----+--------------------+---------+-------------+---------------+-----------+
| ID |      EMP_NAME      | DEPT_ID | POSITION_ID | DEPARTMENT_ID | DEPT_NAME |
+----+--------------------+---------+-------------+---------------+-----------+
| 10 | John Doe           |       1 |           2 |             1 | SECURITY  |
|  1 | Ivan Boika         |       1 |           1 |             1 | SECURITY  |
|  2 | John Rosenshteiner |       1 |           2 |             1 | SECURITY  |
|  3 | Philipp Dauhn      |       2 |           1 |             2 | SALARY    |
|  4 | Sid Vicious        |       2 |           2 |             2 | SALARY    |
+----+--------------------+---------+-------------+---------------+-----------+
```

As we can see, each row from the  `employees` base table apppears
only once in the `vemp_depts` view. Now, let's try to add new employee
through this view:

```
insert into vemp_depts(id, emp_name, dept_id, position_id)
values(20, 'Johny Belaco', 1, 1);
```

As a result, we're getting an "cannot modify a column which maps to a non key-preserved" error, which tells us
that the table doesn't meet the requirements for
updating it through the view.

We know that the problem is not with data, but with database structure.
Let's see how we've created our table and how our query looks inside the view:

```
-- This is what is inside the view
select e.id,
       e.emp_name,
       e.dept_id,
       e.position_id,
       d.id department_id,
       d.dept_name
from employees e
join departments d on e.dept_id = d.id
```

Here, we get each row from the `employees` table and join it with
the `departments` table by the `dept_id` field. In which case it may
be happened that inside the view there will be two records after
joining one single row from the `employees` table with the `departments` table?
Right, when there are two rows in the `departments` table with the same
value in the `id` field. Now there are no such rows, but it doesn't mean
that they will not appear. Now, we have to remember how we have created
the `department` table:

```
create table departments(
    id number,
    dept_name varchar2(100)
)
```

There are no any restrictions for the `id` column. But we can make it
unique by adding a primary or unique key:

```
alter table departments
add (
    constraint departments_pk primary key(id)
)
```

Now, if we try to add a new employee, everything will be fine:

```
-- A row will be added without errors
insert into vemp_depts(id, emp_name, dept_id, position_id)
values(20, 'Random Employee', 1, 1);
```

It should me mentioned that it's impossible to insert rows into
the `departments` table via this view:

```
-- cannot modify a column which maps to a non key-preserved table
insert into vemp_depts(department_id, dept_name)
values(7, 'HEAD DEPARTMENT')
```

The reason is still the same - it's not guaranteed that each employee in the
`employees` table has a unique value of the `dept_id` field.


### Restrictions on changing data via views

There're some cases when changing base tables through a view is not possible:

1. If view has aggregate functions, `group by` constructions, `distinct` operator,
   as well as union operators (`union`, `union all`, `intersect`)
2. If data isn't satisfy conditions in `WITH CHECK OPTION` clause
3. If some column in a base table is `NOT NULL`, doesn't have default value and
   doesn't exist in the view
4. If columns in a view are expressions (something like `nvl(a.value, -1)`)

## Prohibition of data modification through views

To create a read-only view, we can use the  `with read only` modificator:

```
-- Create a read only view
create or replace view vdepartments as
select id, dept_name
from departments
with read only;

-- let's try to insert a row
insert into vdepartments(id, dept_name)
values(11, 'SECURITY');
```

As a result, we get an  `cannot perform a DML operation on a read-only view` error.
