---
Title: "Oracle's object oriented PL/SQL hasn't private methods"
Summary: "And you should think twice before going to use them."
draft: false
---

So, you want to use object-oriented PL/SQL? Don't rush, because
 most probably you will be disappointed by the fact that
object types in Oracle **haven't such thing as access modifiers**.

In English: your objects can't have private methods and fields.
And actually, it's quite funny. Guys at Oracle have added "objects",
but they forgot to add support for encapsulation - one of the key
properties of OOP ( in its common meaning ).

Don't get me wrong - object types still have some advantages -
you can store them in a table, and after fetching you're getting
data with some behaviour, but I think it's better to treat them
as records with functions/procedures. Their other features, like
abstract objects and inheritance, can work only in simple cases,
while implementing complex business logic is hard without encapsulation.
