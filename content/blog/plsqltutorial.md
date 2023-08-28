---
title: "PL/SQL notes"
date: 2021-07-11
toc: true
---


## PL/SQL blocks

Blocks are the building bricks of every PL/SQL program.
Each block consists from 3 parts:

- declaration section
- execution section
- exception section


The first and the last sections are optional.

### Examples

Only execution section:

```sql
begin
    null;
    -- do something
end;
```

Execution and exception sections:

```sql
    begin
    null;
    -- do something
exception
    when no_data_found then
        null;
end;
```

Declaration and execution sections:

```sql
declare
    l_age number(3) := 18;
begin
    null;
    -- do something
end;
```

All three sections:

```sql
declare
    l_age number(3) := 18;
begin
    null;
    -- do something
exception
    when no_data_found then
        null;
end;
```

All examples above are the anonymous blocks, what means
that they can't be called for execution later.
If a block has a name, it is called **named block**, which is
a function or a procedure.</p>

### Declaration section

Declaration section is for declarations.
Variables, constants, types, procedures or functions - all these
objects should be declared here.

Code in the execution section can use all objects,
which are described in the declaration section.


```sql
declare
    l_age number(3);

    function is_age_ok(page) return boolean is
    begin
        return page &gt;= 18;
    end;
begin
    l_age := 18;

    if is_age_ok(l_age) then
        dbms_output.put_line('Age is ok');
    else
        dbms_output.put_line('Age is not ok');
    end if;
end;
```

Here we have declared `l_age` variable and `is_age_ok` function .
All these objects are available in the execution section.

By the way, `is_age_ok` is also a PL/SQL block(named), that means that
pl/sql blocks can be nested.

### Execution section

This section is mandatory. It contains code that **does things**.
All variables, types, constants, functions and procedures, which
are declared in a declaration section, are freely available for
use in the execution section.


### Exception section


This section is for exception handling. It starts with
`EXCEPTION` keyword and contains handlers for all types
of exceptions that we expect in our block.

### Nesting blocks


Blocks can be nested. For example:

```sql
declare
    l_age constant number := 10;
begin
    -- NESTED BLOCK'S START
    declare
        l_name varchar2(50);
    begin
        l_name := 'John Doe';
        dbms_output.put_line('Name is ' || l_name);
        dbms_output.put_line('Age is ' || l_age);
    end;
end;
/
```


In this example we put one block into the execution section
of another block. All blocks have access to all objects which
were declared in outer blocks. We can see this by the fact
that we can use `l_age` variable in our inner block.

But we can't use variables which were declared in inner blocks:

```sql
declare
    l_age constant number := 10;
begin
    declare
        l_name varchar2(50);
    begin
        l_name := 'John Doe';
        dbms_output.put_line('Name is ' || l_name);
        dbms_output.put_line('Age is ' || l_age);
    end;

    -- WE CAN'T USE l_name variable here
    if l_name = 'admin' then
        dbms_output.put_line('User is admin')
    else
        dbms_output.put_line('User is not admin');
    end if;
end;
/
```

#### Block labels

Blocks can have a label which can be used to
access block's variables from the nested blocks.
Usually, this feature only used when nested block
has some variables with the same name as variables
in the parent block:

```sql
<<main>>
declare
    l_name varchar2(50) := 'Charlie';
begin
    <<child>>
    declare
        l_name varchar2(50) := 'John';
    begin
	-- use label to access l_name variable
        -- from parent block
        dbms_output.put_line(main.l_name);
        dbms_output.put_line(child.l_name);
    end;
end;
/
```

After execution, we'll see:

```
Charlie
John
```


#### When to use nested blocks

It's a common advice to use nested blocks for:

- Exception handling - to catch exceptions more closely to
  business-logic code.
- For declaring variables and functions/procedures right before
their usage to "improve readability"

However, I think that second point is more likely "not right" than
"right". If your block became so large that you need to use nested
blocks to declare variables and you think that this move actually
increases current block's readability, more probably you need to split
current block into separate functions/procedures.


### Exceptions in blocks

When some exception is raised, it goes to the execution section of
current block first. If the execution section does not contain a handler
for this type of exception, it goes to the  exception section of
outer block and so on. If the exception was not handled
anywhere in this chain, it is throwed to client side.

```sql
    declare
    l_result number;
begin
    declare
        l_result number;
    begin
        select 1 into l_result
	from dual
	where 1 > 2;
    end;
exception
    when no_data_found then
        dbms_output.put_line('No data found exception catched!');
end;
/
```

We will see "No data found exception catched!" string printed via dbms_output.


## NVL is not lazy

We all use `nvl`.
It's so common and easy(3 chars among 8 in `coalesce` and 6 in `decode`)
to write it in queries, but there is one thing you should keep in mind when
using `NVL`.

Did you know that nvl evaluates both
arguments, even if its first argument is non-null? If yes, go drink beer,
bore, if not - keep reading, memes and also a little pl/sql
examples are waiting for you!



First, let's face the problem:

```sql
create package test_pck is

    function get_user_id return number;
end;
/

create or replace package body test_pck is

    function get_user_id return number
    is
        l_res number;
    begin
        <<lbl>>
        if 1 &lt; 2 then
            goto lbl;
        end if;    end;
end;
/
```

Here we have created the package with the function that
never returns a value, because it contains an infinity loop.

I picked this method for demonstration to be sure that
examples will show you the same result despite IDE
and environment settings you have.

So, let's run this query:

```sql
select nvl(1, test_pck.get_user_id)
from dual
```

It is not responding, right? Ha-ha, this is my first joke.


It tells us that  the `test_pck.get_user_id`
function was called despite the fact that the first parameter is 1,
which is not null.

Generally, it's not a problem. But it may be, if
your second argument in `nvl` is
a heavy function. In this case SQL query might
work slower than you expect.


Do all functions that work with null values
work the same? Let's see:

**COALESCE:**

```sql
-- Lazy
select coalesce(1, test_pck.get_user_id)
from dual
```

**DECODE:**

```sql
-- Lazy
select decode(1, 1, 1, test_pck.get_user_id)
from dual
```

**CASE:**

```sql
-- Lazy
select case
           when 1 = 1 then 1
           else test_pck.get_user_id
       end
from dual
```

We forgot about nvl's brother - **NVL2**

```sql
-- Not Lazy
select nvl2(1, 2, test_pck.get_user_id)
from dual
```


Yes, it's not lazy, like `nvl`.


### What to choose


![nvl meme](/img/nvl-meme-1.jpg)


I think it's not a problem when you use
`nvl` with "static" values. But
if you use functions as one (or both) arguments
to nvl, it may be good to replace it with a call to
something lazier.


![nvl meme](/img/nvl-meme-2.jpg)
