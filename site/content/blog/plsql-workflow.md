---
Title: "Development practices for PL/SQL code"
draft: false
Summary: "Must-have practices
when you work with the Oracle database."
---

In this article I'll try to summarize must-have practices
for dealing with DB-related code in your
projects. If the main language of
your project is PL/SQL, I hope you will not read anything
new here, but I encourage you to read it anyway.

**Summary**: SQL and PL/SQL is code, too.
Comment it, keep it under version control.
Use packages and avoid using standalone procedures/functions.
Avoid non-packaged code in scheduled jobs and aim to reduce
triggers usage.


## Keep any db related code in source code files

If you're working with DB objects
directly in the database, I have bad news for you.

Most probably, you keep your main (frontend, or backand)
source code under version control system, and you may list
at least a few benefits of doing so.  But if your PL/SQL
code (and anything related to the database)
is the part of your project, why it should be ignored?

It's a simple truth, but here are main advantages of
using VCS (Version Control System) for PL/SQL and database code:

- VCS allows many developers work on a single package.
  Many conflicts will be handled automatically, or at least
  you will see what other developers want to do with the
  same part you're working on
- Revert changes
- Commit messages can help you to understand business logic

Database code is the most difficult to work on it for more than
one developer if it isn't under version control and exists only
in the database.

Imagine - you're working on some function in a package,
and you've just modified its business-logic. At the same
time, another one developer has changed another function
*in the same package*. How will this package work when
you both compile it? **You don't know** (who is the last?).

Another one situation is more fatal - **someone may drop
your package/function/view** and you can't say why he did it
and how to revert these changes.

I recommend **to keep these object as source code files and keep them
versioned:**

- packages
- triggers
- views
- jobs
- standalone functions/procedures

The directory structure may be organized like this:

```
project name
|
+--DB
   |
   +--packages
   +--views
   +--triggers
   +--jobs
   +--standalone
```

## Workflow example

Let's imagine that you've decided to write a view with
active users. First, you have to pick a name for it respectively
to your company's guidelines. Once you did it, open your IDE or a text editor
and create a file for view (for example, `vactive_users.sql`). Then start writing
a sql query:

```
-- File: projectname/DB/views/vactive_users.sql
-- This view returns currently active users.
-- Note that we also don't want deleted users to
-- be in the result.
-- TODO: Create functional index on `deleted_at` column
select u.login,
       u.reg_date,
       u.email,
       .......
from users u
where u.deleted_at is null
and u.is_active = 0;

comment on table vactive_users is 'Only active users';
```

When you think you're done, **save the file first**, and then compile it.
Then, fix any syntaxic or logical errors and **save the file again**.
Then compile it again and repeat previous steps untill the view is finished.
At the end, **add file `vactive_users.sql` to the VCS you use**.


```goat
+--------------+   +------------+   +--------------+    +-----+ Yes +----------+
|  Create file +-->| Write code +-->|Save, compile +--->| OK? +---->|Add to VCS|
+--------------+   +------------+   +--------------+    +-+---+     +----------+
                        ^     No                          |
                        +---------------------------------+
```

This approach (keeping DB objects in VCS) allows to work on your project in a more consistent way,
because now all your source code lies in the project's repository. You always can open any
package/view/function without necessity to connect to the Oracle (for example, you
may working on a web backend module and forget which fields contains some view, or which fields
returns some procedure/cursor, and so on. In such situations you just quickly open required file and
you're done).

I believe it's also a good idea to document views right in sql files.
At the beginning of the file the view is documented like it's ordinary code - what this view is about,
why do we need it, where to use it, maybe some comment-only directives (like `TODO` in the example
above). I use database comments (Oracle's `comment on vactive_users is 'View for active users'`)
only for short summary description.


## Use packages as much as possible

Packages consist from two parts - specification and implementation.
It's better to split them into two files. I personally prefer
to save specification with `*.pks` extension (Package specification), and
implemendation with `*.pkb` (Package body).

I can't imagine Oracle-driven development without using packages.
They not only allow to group functions/procedures into modules, but
also support incapsulation and have package-level state.

Packing functions into a package also increases code readability. Compare
these two examples:

```
declare
    l_change_user_id app_users.id%type := 100;
    l_del_user_id    app_users.id%type := 120;
    l_change_emp_id  employees.id%type := 100;
    l_del_emp_id     employees.id%type := 120;
begin
    del_user(l_del_user_id);
    change_name(l_change_user_id, 'Mike76');
    change_emp_name(l_change_emp_id, 'John');
    del_employee(l_del_emp_id);
end;
```

```
declare
    l_change_user_id app_users.id%type := 100;
    l_del_user_id    app_users.id%type := 120;
    l_change_emp_id  employees.id%type := 100;
    l_del_emp_id     employees.id%type := 120;
begin
    -- It's clear that user will be deleted,
    -- not employee
    pck_users.delete(l_del_user_id);
    pck_users.change_name(l_change_user_id, 'Mike76');
    pck_employee.change_name(l_change_emp_id, 'John');
    pck_employee.delete(l_del_semp_id);
end;
```

In the first example, we use global procedures, while in the second -
packages. Note that we have to use different names for similar tasks in the
first example - procedures `delete_user` and `delete_employee` have the
same parameters signature, and we can't give them the same name.

With packages, it's not a problem at all. Similar tasks have the same name
across packages. Package name works like "context", simplifying understanding
of what your code actually does.

It's just one of the many advantages of using packages. I'll list a few more
soon.


## Avoid using triggers

Triggers complicate the flow of your program and
don't allow you to see its "whole picture".

Let's try to implement new feature in our system -
user deletion. When user is being deleted, all
pending orders of this user should be transitioned to
the 'Closed' status.

With triggers, you have to write a trigger on the `users`
table, which will update status in the `orders` table.
Very simple, you may say, but even such a simple
example illustrates how triggers suck for this task.

First, how will we launch the user deletion process?
We don't want to delete rows from the database, because
we use so called "soft delete" (it's when `deleted_at` column is
filled with deletion date). Therefore, anywhere in our program
we have to write something like this:

```
begin
    update app_users
    set deleted_at = systimestamp
    where id = l_user_id;
end;
```

Imagine that you watch at this code half a year later.
What this code actually tells you? It tells that
`deleted_at` column is updated. That's all. You have to
always remember that **exactly this SQL** is the user deletion.
And you don't know anything about what the hell is going on
after this.

Also, the trigger will run everytime when the `users` table is updated, and
we have to handle such situations, something like this:

```
create or replace trigger user_bu
-- We can also create trigger that will listen
-- updates only on deleted_at column, but it doesn't
-- change anything
before update
on table users
....
   if :new.deleted_at is not null and :old.deleted_at is null then
       update orders o
       set o.status = 'CLOSED'
       where o.user_id = :old.id
       and o.status = 'PENDING';
   end if;

```

And this is just for user deletion. This trigger will grow
everytime we need to add another one feature related to the
`users` table.

This is how the same task would look like if
we used packages:

```
declare
    l_user_id app_users.id%type := 100;
begin
    pck_users.delete(l_user_id);
end;
```

Now, when a developer see this code,
he will know that it deletes the user, because
`pck_users.delete(l_user_id)` string is verbal.
Let's imagine that the developer would know how
exactly user deletion works. He opens the
`pck_users.pkb` file and searches for the `delete` procedure:

```
...
procedure delete(
   puser_id app_users.id%type
)
is
begin
   update app_users
   set deleted_at = systimestamp
   where id = puser_id;

   update orders o
   set o.status = 'CLOSED'
   where o.user_id = puser_id
   and o.status = 'PENDING';
end;
...
```

Now, the picture is clear.

There're many benefits of using packages over triggers, I'll list just some of them:

- packages are  verbal and give understanding about what part of the business logic is affected
- they separate interface and implementation
- you can control execution privilleges to them
- they work on a more high-level abstraction levels than triggers

### When triggers are fine

- Audit triggers
- Autofill some values
- Prevent table from being changed

## Don't use complicated code in scheduled jobs

Ok, here is an example of how you can create scheduled job in
Oracle:

```
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
   job_name                 =>  'my_new_job2',
   job_type                 =>  'PLSQL_BLOCK',
   job_action               =>  'BEGIN SALES_PKG.UPDATE_SALES_SUMMARY; END;',
   schedule_name            =>  'my_saved_schedule');
END;
/
```

**This example is fine**. But please, don't create scheduled jobs like this:

```
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
   job_name                 =>  'my_new_job2',
   job_type                 =>  'PLSQL_BLOCK',
   job_action               =>  'DECLARE' ||
   'l_id number;' ||
   'BEGIN' ||
   'select id into l_id from some_table;' ||
   'delete from another_table where id = l_id;' ||
   'END;'
   schedule_name            =>  'my_saved_schedule');
END;
```

Instead, **move complicated code into a package-level procedure**, like in the first
example.
