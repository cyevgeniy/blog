---
title: "SQL puzzle: Calendar"
date: 2021-09-09
---

Found an interesting SQL puzzle: 
[Calendar of Current Year](https://nimishgarg.blogspot.com/2020/02/sql-puzzle-calendar-of-current-year.html).
Here is my solution. Most probably this query may be
tuned to more readable solution, but anyway, it is seemed to work.

Actually, there is one big bug - calendar headers are hard-coded.
It was more correct to generate such string on the fly, with taking
into account database language settings, but I am too lazy to do this.

Also, I think that original solution is kind of cheaty - it uses
SQLPlus formatting settings, while query below generates string rows :)

```sql
-- Created: 2021/06/16
select cal_row
from (

select 
       case 
           when a.start_month_flag = 1 then rpad(to_char(a.mnth, 'month'), 15, ' ')
           else rpad(' ', 15, ' ')
        end || a.cal_row cal_row,
        a.mnth,
        a.rn, 
        0 flag
from (

select a.*,
       case
           when lag(a.mnth) over (order by a.week_flag, a.rn) <> a.mnth or lag(a.mnth) over (order by a.week_flag, a.rn) is null then 1
           else 0
       end start_month_flag,
              case
           when lag(a.mnth) over (order by a.week_flag, a.rn) <> a.mnth or lag(a.mnth) over (order by a.week_flag, a.rn) is null then a.rn
           else null
       end start_month_rn
from (
select a.week_flag, a.mnth, min(a.dw), lpad(listagg(a.dd, ' ') within group(order by a.dt), length(listagg(a.dd, ' ') within group(order by a.dt)) + (min(a.dw) - 1) * 2 + min(a.dw) - 1, ' ') cal_row,
      row_number() over (order by week_flag) rn
from (

select case
           when a.cal_week_flag is not null then a.cal_week_flag
           else last_value(a.cal_week_flag ignore nulls) over (order by dt) 
       end week_flag,
       --to_char(a.dm, 'month') mnth,
       trunc(dm, 'mm') mnth,
       a.* 
from (
select dm,
       dw,
       dt,
       dy,
       dd,
       case
           when lag(dw) over (partition by trunc(dm, 'mm') order by dt) is null or dw = 1 then rownum
           else null
       end cal_week_flag
from (
select trunc(a.ds + level - 1) dm, to_char(a.ds + level - 1, 'd') dw,  a.ds + level - 1 dt, lpad(extract(day from a.ds + level - 1), 2, '0') dd, to_char(a.ds + level - 1, 'dy') dy
from (
    select trunc(sysdate, 'yyyy') ds
    from dual
) a
connect by level <= add_months(trunc(sysdate, 'yyyy'), 12) - trunc(sysdate, 'yyyy')
)) a
)a
group by a.week_flag, a.mnth) a)a


union all

select 


       case when mod(level , 2) = 1 then 'Month          Su Mo Tu We Th Fr Sa'
       else '-------------- -- -- -- -- -- -- --'
       end cal_row, 
       add_months(trunc(sysdate, 'yyyy'), round(level / 2) - 1) mnth,
       case when mod(level , 2) = 1 then -1
       else 0 end rn,
        -1 flag
from dual
connect by level <= 24
)a 
order by a.mnth, flag, rn
```

Result:

```
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
january                       01 02
               03 04 05 06 07 08 09
               10 11 12 13 14 15 16
               17 18 19 20 21 22 23
               24 25 26 27 28 29 30
               31
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
february          01 02 03 04 05 06
               07 08 09 10 11 12 13
               14 15 16 17 18 19 20
               21 22 23 24 25 26 27
               28
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
march             01 02 03 04 05 06
               07 08 09 10 11 12 13
               14 15 16 17 18 19 20
               21 22 23 24 25 26 27
               28 29 30 31
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
april                      01 02 03
               04 05 06 07 08 09 10
               11 12 13 14 15 16 17
               18 19 20 21 22 23 24
               25 26 27 28 29 30
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
may                              01
               02 03 04 05 06 07 08
               09 10 11 12 13 14 15
               16 17 18 19 20 21 22
               23 24 25 26 27 28 29
               30 31
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
june                 01 02 03 04 05
               06 07 08 09 10 11 12
               13 14 15 16 17 18 19
               20 21 22 23 24 25 26
               27 28 29 30
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
july                       01 02 03
               04 05 06 07 08 09 10
               11 12 13 14 15 16 17
               18 19 20 21 22 23 24
               25 26 27 28 29 30 31
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
august         01 02 03 04 05 06 07
               08 09 10 11 12 13 14
               15 16 17 18 19 20 21
               22 23 24 25 26 27 28
               29 30 31
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
september               01 02 03 04
               05 06 07 08 09 10 11
               12 13 14 15 16 17 18
               19 20 21 22 23 24 25
               26 27 28 29 30
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
october                       01 02
               03 04 05 06 07 08 09
               10 11 12 13 14 15 16
               17 18 19 20 21 22 23
               24 25 26 27 28 29 30
               31
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
november          01 02 03 04 05 06
               07 08 09 10 11 12 13
               14 15 16 17 18 19 20
               21 22 23 24 25 26 27
               28 29 30
Month          Su Mo Tu We Th Fr Sa
-------------- -- -- -- -- -- -- --
december                01 02 03 04
               05 06 07 08 09 10 11
               12 13 14 15 16 17 18
               19 20 21 22 23 24 25
               26 27 28 29 30 31
```
