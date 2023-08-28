---
title: "Building Delphi application with Python"
date: 2022-03-14
toc: false
---

## The problem we needed to solve

In the company I work we develop and support some count of
desktop applications written in Delphi with a high usage of PL/SQL code
in the database. Besides building and copying an executable file to FTP server,
there are some additional steps we usually do:

-   Building documentation (with Sphinx framework) and copying it to FTP server
-   Running database migrations
-   Compiling PL/SQL packages that we have changed since the last version

Nowdays, a Python script does all these things, and I am going to tell which
steps we have done and what we plan to do to automate the build process
even more.

## The old way - using of a batch script

First thing that we were using is a batch script that was building an
application, right from CMD console or PowerShell. It looked like this:

```gkhjg
rem get the current branch name #http://stackoverflow.com/questions/6245570/get-current-branch-name
for /f "delims=" %%a in ('git rev-parse --abbrev-ref HEAD') do @set original_branch=%%a

if %original_branch%==production (

call rsvars.bat
msbuild program.dproj /p:config=Release /t:Build
upx.exe program.exe

xcopy /R /Y program.exe A:FTP\LOCATION
xcopy /R /Y changelog.md A:FTP\LOCATION
goto end
)

if %original_branch%==testing (

call rsvars.bat
msbuild project.dproj /p:config=Release /t:Build
upx.exe program.exe


echo Copying executable to test directory...
xcopy /R /Y program.exe A:FTP\TEST\LOCATION

goto end
)

call rsvars.bat
msbuild projectfile.dproj /p:config=Release /t:Build

:end
```

Here, we are using `msbuild` to build our app, but for successfull build
we also need to setup required environment variables. Luckily, RAD Studio
comes with the `rsvars.bat` script, which setups them for us. This script is located at
`C:\Program Files (x86)\Embarcadero\Studio\RAD_VERSION\bin\` directory,
so you must add it to the `PATH` system variable. The last action usually isn't required -
the PATH has been updated during RAD Studio's installation.

### Executable file compression

After build, the executable file's size is about 25 MB - not so much
nowdays, but anyway, we compress it with the help of the program called
**upx** . This step decreases size to approximately 11 MB - much better!

## Why Python

Batch script is fine for builds, but we wanted to automate our database
migrations - we were running them as raw SQL files by hands - and we
started to search for a tool that can make this job for us.

At that time, we  had been already using [Sphinx](https://www.sphinx-doc.org) for
documentation, which is written in Python, and it was already installed
on our computers. Thus, to reduce
the count of used technologies, we picked Python as the main
language for automating our migrations.

First way that we wanted to try is to keep writing our migrations in raw SQL
and execute them in a some way with python. For this, we needed a driver for the
Oracle database. Thanks to python popularity, it wasn't a problem -
[cx_Oracle](https://cx-oracle.readthedocs.io/en/latest/) is easy to
install and it works well. But implementation of migrations
requires a lot of work, such as keeping the
history of changes and migrations' rollbacks. And we would these things should
be automated. At that time, the history of schema changes had been implemented
with the `migrations` table, where we were writing(by hands) the names
of the SQL scripts.
Rollback mechanism wasn't implemented at all - we were writing SQL for
\"upgrading\" schema, but not for changes\'
rollbacks.
Because of all these factors, we started to look for a migration tool,
like `artisan migrate` for Laravel. The tool was found fast:
[alembic](https://alembic.sqlalchemy.org/en/latest/), and after a few
series of tests we approved it as our new migration tool.

## Automating migrations with alembic

Migrations are the changes to a database schema, like adding a column to a table, dropping
or creating new tables, creating indexes and so on.
Developers write migrations to be able to reproduce on a production database all changes
that they made during development. We were writing migrations as raw SQL scripts,
and then we were running them by hands in a IDE.
Sometimes we needed to revert a few last changes in
the database, and we had to write new migration scripts for
that and run them by hands again.

Alembic can, as any other migration tool, I believe, not only manage
schema's upgrades, but also revert them. First thing you need to do is to
install it on your system. It\'s better to follow the instructions from the
[official
documentation](https://alembic.sqlalchemy.org/en/latest/front.html#installation).
After that, the only thing you need to make it work is to configure
connection to your database. To do this, search for `sqlalchemy.url`
parameter in the `alembic.ini` file and modify it according to your
database settings. We use Oracle, and in our case it looks like
`oracle://user:password@tnsstring`. Now, we can create our migrations:

    alembic revision -m "Create orders table"

This command creates a migration file, like
`1975ea83b712_create_orders_table.py`. It looks like this:

    """create orders table

    Revision ID: 1975ea83b712
    Revises:
    Create Date: 2022-03-14 00:30:12.097402

    """

    # revision identifiers, used by Alembic.
    revision = '1975ea83b712'
    down_revision = None
    branch_labels = None

    from alembic import op
    import sqlalchemy as sa

    def upgrade():
        pass

    def downgrade():
        pass

Here are two functions, `upgrade` and `downgrade`. The first one contains
the code for running the migration and the second one is for reverting
the migration. Alembic uses SQLAlchemy ORM to talk with a database, but
we didn't want to learn another one language - we like SQL, - so we have
changed the migrations’ template in a way that it run the queries that are
represented as multiline strings. This is the example of the migration written in a such way:

```
"""Add new job code

Revision ID: 51fcd3a1495a
Revises: 569638f10ae3
Create Date: 2022-02-28 14:27:18.470653

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '51fcd3a1495a'
down_revision = '569638f10ae3'
branch_labels = None
depends_on = None

up = '''
insert into user_jobs(job_code, description, enabled, job_name)
values('DATEOFFS', 'Updates dates columns', 1, 'Job description')
'''

down = '''
delete from user_jobs
where job_code = 'DATEOFFS'
'''

def upgrade():
    connection = op.get_bind()
    connection.execute(up)


def downgrade():
    connection = op.get_bind()
    connection.execute(down)
```

Alembic's template file is placed in the alembic's root directory, and it looks like this:

```
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

def compile_package(con, dir, name):
    pck = open(f"{dir}/{name}.pks", 'r', encoding="utf-8")
    spec = pck.read()
    pck.close()
    pck = open(f"{dir}/{name}.pkb", 'r', encoding="utf-8")
    body = pck.read()
    pck.close()

    con.execute(spec)
    con.execute(body)

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}

up = '''

'''

down = '''

'''

def upgrade():
    connection = op.get_bind()
    connection.execute(up)
    ${upgrades if upgrades else "pass"}


def downgrade():
    connection = op.get_bind()
    connection.execute(down)
    ${downgrades if downgrades else "pass"}
```

The `compile_package` procedure is used for packages compilation - I will
tell about it in a while.

### Workflow example

Let’s say we want to add a column `deleted_at` to the orders table for implementing  “soft delete” feature.
It  means that  records actually are not being deleted, but
instead `deleted_at` column is being filled with deletion’s date.
New migrations are created by `alembic revision` command:

```
alembic revision -m "Add deleted_at column to the orders table"
```

Then, we need to write a SQL for adding the column, as well as its dropping:

```
"""Add deleted_at column to the orders table

Revision ID: 51fcd3a1495a
Revises: 569638f10ae3
Create Date: 2022-02-28 13:24:18.200553

"""
from alembic import op
import sqlalchemy as sa

def compile_package(con, dir, name):
    pck = open(f"{dir}/{name}.pks", 'r', encoding="utf-8")
    spec = pck.read()
    pck.close()
    pck = open(f"{dir}/{name}.pkb", 'r', encoding="utf-8")
    body = pck.read()
    pck.close()

    con.execute(spec)
    con.execute(body)

# revision identifiers, used by Alembic.
revision = '51fcd3a1495a'
down_revision = '569638f10ae3'
branch_labels = None
depends_on = None

up = '''
alter table orders add (
    deleted_at date
)
'''

down = '''
alter table orders drop column deleted_at
'''

def upgrade():
    connection = op.get_bind()
    connection.execute(up)


def downgrade():
    connection = op.get_bind()
    connection.execute(down)
```

When we want to run all unapplied migrations, we use `alembic upgrade head`:

```
$ alembic upgrade head
INFO  [alembic.runtime.migration] Context impl OracleImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade d6b52f2ecdc1 -> 5a65890ee7f3, Add deleted_at column to the orders table
```

To view migrations' history, `alembic history` command is used. This is the
example of its output:

```
$ alembic history
d6b52f2ecdc1 -> 5a65890ee7f3 (head), Add deleted_at column to the orders table
b946fd911cc2 -> d6b52f2ecdc1, Increase order_num size
51fcd3a1495a -> b946fd911cc2, Create user_pref table
569638f10ae3 -> 51fcd3a1495a, Drop unused columns in orders table
036b4e19a77c -> 569638f10ae3, Set default value for created_at column
<base> -> 036b4e19a77c, Create some tables
```
View current revision:

```
$ alembic current
```

Run next one migration:

```
$ alembic upgrade +1
```

Revert last one migration:

```
$ alembic downgrade -1
INFO  [alembic.runtime.migration] Context impl OracleImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running downgrade 5a65890ee7f3 -> d6b52f2ecdc1, Add deleted_at column to the orders table
```

### Limitations

- No need for `;` at the end of SQL command
- If migration requires more than one SQL command, you have to
  split them into separate calls - it seems like alembic can't execute
  SQL with multiple separated statements. Thus, migration with
  multiple statements appears to be like this:
  ```
    """Add deleted_at column to the orders table

  Revision ID: 51fcd3a1495a
  Revises: 569638f10ae3
  Create Date: 2022-02-28 13:24:18.200553

  """
  from alembic import op
  import sqlalchemy as sa

  def compile_package(con, dir, name):
      pck = open(f"{dir}/{name}.pks", 'r', encoding="utf-8")
      spec = pck.read()
      pck.close()
      pck = open(f"{dir}/{name}.pkb", 'r', encoding="utf-8")
      body = pck.read()
      pck.close()

      con.execute(spec)
      con.execute(body)

  # revision identifiers, used by Alembic.
  revision = '51fcd3a1495a'
  down_revision = '569638f10ae3'
  branch_labels = None
  depends_on = None

  # Create table
  ct = '''
  alter table orders add (
      deleted_at date
  )
  '''

  # Add column
  ac = '''
  alter table some_table
  add(
      column_name number
  )
  '''

  # Drop table
  dt = '''
  alter table orders drop column deleted_at
  '''

  # Drop column
  dc = '''
  alter table some_table
  drop column column_name
  '''

  def upgrade():
      connection = op.get_bind()
      connection.execute(ct)
      connection.execute(ac)

  def downgrade():
      connection = op.get_bind()
      connection.execute(dt)
      connection.execute(dc)
  ```

## Recompiling PL/SQL packages

We recompile needed packages in migrations. For this,
a helper function has been added to the migration template:

```
def compile_package(con, dir, name):
    pck = open(f"{dir}/{name}.pks", 'r', encoding="utf-8")
    spec = pck.read()
    pck.close()
    pck = open(f"{dir}/{name}.pkb", 'r', encoding="utf-8")
    body = pck.read()
    pck.close()

    con.execute(spec)
    con.execute(body)
```

We keep our packages under the version control and work with them
by modifying corresponding files. Specification is stored in files with
"\*.pks" extension, and body files have "\*.pkb" extension.

Usually, implementation of a some feature don't affect much packages,
so we are fine with this function. If you usually compile a lot of
packages, it's better to add another one function that will accept
a list of the filenames. Package files shouldn't contain a final slash
in the source files, like this:

**Will NOT be compiled**:

```
create or replace package pck_test as

-- Some code

end pck_test;
/
```

**Will be compiled**:

```
create or replace package pck_test as

-- Some code

end pck_test;
```

**Note:** Final semicolon, in the difference with SQL commands, is required.

We create separate migration for packages compilation, but without
any code in the `downgrade` function - "uncompiling" is not supported. Here is
the part of such migration:

```
def upgrade():
    connection = op.get_bind()
    compile_package(connection, "DB/packages", "package_name_1")
    compile_package(connection, "DB/packages", "package_name_2")
    compile_package(connection, "DB/packages", "package_name_3")
    pass


def downgrade():
    pass
```


## Replacing batch file with Python script

Our first step was to implement the functionality of the batch script in python.
We needed to make a bunch of calls to external programs, like in the batch script,
and it is possible with `subprocess.run` function. In the batch script we had been
executing `rsvars.bat` before build. This script setups environment variables,
so we needed to make them visible for msbuild during its work.
Luckily, the third parameter in `subprocess.run` is environment object, which serves exactly for this purpose.
In our case, `rsvars.bat` looked like this:

```
@SET BDS=C:\Programs\Embarcadero\Studio\20.0
@SET BDSINCLUDE=C:\Programs\Embarcadero\Studio\20.0\include
@SET BDSCOMMONDIR=C:\Users\Public\Documents\Embarcadero\Studio\20.0
@SET FrameworkDir=C:\Windows\Microsoft.NET\Framework\v4.0.30319
@SET FrameworkVersion=v4.5
@SET FrameworkSDKDir=
@SET PATH=%FrameworkDir%;%FrameworkSDKDir%;C:\Programs\Embarcadero\Studio\20.0\bin;C:\Programs\Embarcadero\Studio\20.0\bin64;C:\Programs\Embarcadero\Studio\20.0\cmake;C:\Users\Public\Documents\Embarcadero\InterBase\redist\InterBase2020\IDE_spoof;%PATH%
@SET LANGDIR=EN
@SET PLATFORM=
@SET PlatformSDK=
```

We placed all configuration parameters in the `config.ini` file, including these variables.
When the script starts, it loads environment variables into an object and
then passes it to `subprocess.run`. We didn't care much about clean and "pythonic"
code - our goal was to make things done as fast as we can,
and we finished up with these two scripts. All these files are located in the `build`
directory in the project's root folder:

**buildconfig.py:**

```
import configparser
import os


class BuildConfig():
    def __init__(self, fname):
        self.fname = fname

        config = configparser.ConfigParser()
        config.read(fname)

        build_sec = config['build']
        self.BDS = build_sec['BDS']
        self.BDSINCLUDE = build_sec['BDSINCLUDE']
        self.BDSCOMMONDIR=build_sec['BDSCOMMONDIR']
        self.FrameworkDir=build_sec['FrameworkDir']
        self.FrameworkVersion=build_sec['FrameworkVersion']
        self.FrameworkSDKDir=build_sec['FrameworkSDKDir']
        self.DOCSMAKE=build_sec['DOCSMAKE']
        self.DOCSBUILDDIR=build_sec['DOCSBUILDDIR']
        self.DOCSSOURCEDIR=build_sec['DOCSSOURCEDIR']
        self.LANGDIR=build_sec['LANGDIR']
        self.PLATFORM=build_sec['PLATFORM']
        self.PlatformSDK=build_sec['PlatformSDK']
        self.IDESPOOF = build_sec['IDESPOOF']

        ftp_sec = config['ftp']
        self.FTPHOST=ftp_sec['FTPHOST']
        self.FTPUSER=ftp_sec['FTPUSER']
        self.FTPPASSWORD=ftp_sec['FTPPASSWORD']
        self.FTPDEST=ftp_sec['FTPDEST']
        self.FTPDESTTEST=ftp_sec['FTPDESTTEST']

        proj_sec = config['project']
        self.PROJDIR = proj_sec['PROJDIR']
        self.UPXPATH = proj_sec['UPXPATH']
        self.EXECUTABLE = proj_sec['EXECUTABLE']

    def build_env(self):
        env = os.environ.copy()
        env['BDS'] = self.BDS
        env['BDSINCLUDE'] = self.BDSINCLUDE
        env['BDSCOMMONDIR'] = self.BDSCOMMONDIR
        env['FrameworkDir'] = self.FrameworkDir
        env['FrameworkVersion'] = self.FrameworkVersion
        env['FrameworkSDKDir'] = self.FrameworkSDKDir
        env['PATH'] = self.FrameworkDir + ";" + self.BDS + r"/bin;" + self.BDS + r"/bin64;" + self.BDS + r'/cmake;' +\
            f"{self.IDESPOOF};" + env['PATH']

    return env
```

**build.py:**

```
import subprocess
import os
import ftplib
import argparse
import buildconfig

def upload(exe, host, user, password, dest):
    fserv = ftplib.FTP(host, user, password)
    try:
        fserv.cwd(dest)
        with open(exe, "rb") as file:
            fserv.storbinary(f"STOR {exe}", file)
    finally:
        fserv.quit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--migrate', dest='migrate', help='Run migrations', action='store_true')
    parser.add_argument('--compress', dest='compress', help='Compress exe file by UPX',  action='store_true')
    parser.add_argument('--upload', dest='upload', help='Upload exe to FTP',  action='store_true')
    parser.add_argument('--upload-test', dest='upload_test', help='Upload exe to FTP',  action='store_true')
    parser.add_argument('--builddocs', dest='builddocs', help='Build documentation',  action='store_true')

    args = parser.parse_args()

    inipath = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'config.ini')
    config = buildconfig.BuildConfig(inipath)
    env = config.build_env()

    print("Building executable...", end="", flush=True)
    os.chdir(config.PROJDIR)
    subprocess.run([config.FrameworkDir + "/MSBuild.exe", "projectfile.dproj", r"/p:config=Release", r"/t:Build"],stdout=subprocess.PIPE, env=env)
    print("Done")

    if args.compress:
        print("Compressing...", end="", flush=True)
        subprocess.run([f"{config.UPXPATH}/upx.exe", f"{config.EXECUTABLE}"], stdout=subprocess.PIPE, check=True)
        print("Done")

    if args.migrate:
        subprocess.run(["alembic", "upgrade", "head"], check=True)

    if args.builddocs:
        subprocess.run([config.DOCSMAKE, "-M", "html", config.DOCSSOURCEDIR, config.DOCSBUILDDIR])

    if args.upload or args.upload_test:
        host, user, password = config.FTPHOST, config.FTPUSER, config.FTPPASSWORD

        if args.upload:
            dest = config.FTPDEST
        else:
            dest = config.FTPDESTTEST

        print("Uploading executable to FTP...", end="", flush=True)
        upload(f"{config.EXECUTABLE}", host, user, password, dest)
        print("Done!")

if __name__ == "__main__":
        main()
```

Configuration is kept in the `config.ini` file - here is an example of such
file, but without any sensitive data:

**config_example.ini**

```
    [build]

    BDS= C:/Programs/Embarcadero/Studio/20.0
    BDSINCLUDE=C:/Programs/Embarcadero/Studio/20.0/include
    BDSCOMMONDIR=C:/Users/Public/Documents/Embarcadero/Studio/20.0
    FrameworkDir=C:/Windows/Microsoft.NET/Framework/v4.0.30319
    FrameworkVersion=v4.5
    FrameworkSDKDir=
    DOCSMAKE=sphinx-build
    DOCSBUILDDIR=D://projDir/docs/build
    DOCSSOURCEDIR=D://projDir/docs/source
    LANGDIR=EN
    PLATFORM=
    PlatformSDK=
    IDESPOOF=C:/Users/Public/Documents/Embarcadero/InterBase/redist/InterBase2020/IDE_spoof

    [ftp]

    FTPHOST=
    FTPUSER=
    FTPPASSWORD=
    FTPDEST=FTP/PATH
    FTPDESTTEST =FTP/PATH
    [project]

    PROJDIR = D://projDir/
    UPXPATH = D://projDir/
    EXECUTABLE=exefile.exe
```

All environment variables are located in the build group.
The `project` section contains  paths to upx.exe, to the root of the project
and the name of the executable file. The `ftp` group contains settings for FTP:
connection and location for an executable file.
We use the following command to run build:

    python build/build.py --compress --migrate --builddocs --upload

List of options:

- `compress` - compress exe file with upx
- `migrate` - run migrations
- `builddocs` - build documentation
- `upload` - upload executable to FTP server
- `upload-test` - upload executable to FTP server, but in another

None of these command line flags are required. By default, `build.py`
only builds an executable file.

## What\'s next?

Described solution can't be called a good one. It's quick and dirty, it requires
some grinding, but it works. Next step - relocate this process to Jenkins' instance.
