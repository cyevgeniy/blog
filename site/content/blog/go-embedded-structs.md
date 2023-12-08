---
title: "Embedded structs in Go"
date: 2022-10-23
---

I decided to document interesting things that I discover while
learning something, and this is the first post in a such manner. I like Go
programming language and trying to write simple programs in it (
at least [one]({{< relref "/writing/programming/proj/2022-07-17-pldoc" >}}) helped me to generate docs for
our pl/sql codebase, and I think it may be helpful even for someone else, too),
and recently I was puzzled by one single line in the [Gin framework](https://github.com/gin-gonic/gin)
when I was trying to understand how its `Engine` struct is implemented.

It was looked like this:

```
// Engine is the framework's instance, it contains the muxer, middleware and configuration settings.
// Create an instance of Engine, by using New() or Default()
type Engine struct {
	RouterGroup
    ....
    ....
}
```

Why `RouterGroup` is written here as a type, without a field name?
So, here are my investigations.

## Embedded fields

In Go, we can embed one structure into another when we declare
a type.

```
package main

import "fmt"

type User struct {
    Name string
    LastName string
}

type SpecifiedUser struct {
    User // <--- MAY BE VERY FRUSTRATING
    Id uint64
    Subsystem string
}

func main() {
	var u SpecifiedUser

	u.Name = "Alex"

	fmt.Println(u.Name)
}
```

See, we didn't declare `Name` field directly in the `SpecifiedUser` struct, it
was just injected from the `User` type.

If we run this program, it will print string "Alex".

What about methods? I mean, if a `User` struct has, for example, a `printUserName` method,
will `SpecifiedUser` also has this method? Let's try:

```
package main

import "fmt"

type User struct {
    Name string
    LastName string
}

func (u User) printUserName() {
	fmt.Println("User name print")
}

type SpecifiedUser struct {
    User
    Id uint64
    Subsystem string
}

func main() {
	var u SpecifiedUser

	u.printUserName()
}
```

Run the program:

```
go run ./go-embedded-structs.go
User name print
```

Boom! Method also has been embedded! But this was a "stateless" method - it prints just
a constant string. Let's see how it will work if we try to print `Name` field:

```
package main

import "fmt"

type User struct {
    Name string
    LastName string
}

func (u User) printUserName() {
	fmt.Println(u.Name)
}

type SpecifiedUser struct {
    User
    Id uint64
    Subsystem string
}

func main() {
	var u SpecifiedUser

	u.Name = "Alex"

	u.printUserName()
}
```

```
go run ./go-embedded-structs.go
Alex
```

Since I know that fields and methods are injected, it's not a big surprise, but still
interesting and important result.

## When a parent struct has the same field name as an embedded

My next question was: "What if there are fields with the same names?".
I thought that Go will throw an error, but I was wrong:

```
package main

import "fmt"

type User struct {
    Name string
    LastName string
}

func (u User) printUserName() {
	fmt.Println(u.Name)
}

type SpecifiedUser struct {
    User
    Name string
    Id uint64
    Subsystem string
}

func main() {
	var u SpecifiedUser

	u.Name = "Alex"

	u.printUserName()
}
```

However, this program prints nothing. But if we try to print `Name` field manually,
it works:

```
func main() {
	var u SpecifiedUser

	u.Name = "Alex"

	u.printUserName()
	fmt.Println(u.Name)
}
```

Program with this `main` function prints this:

```
Alex
```

## Final thoughts

Field embedding is a great way to compose new
types out of already existed ones, and it really
looks elegant, like almost everything in Go that I know at
this moment.
